const File = require('../models/File');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Upload file (supports both authenticated users and guests)
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { folder } = req.body;
    const isGuest = !req.user;

    const file = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      user: isGuest ? null : req.user._id,
      folder: isGuest ? null : (folder || null),
      shareLink: uuidv4(),
      isPublic: isGuest, // Guest uploads are shared by default
    });

    // Update user storage used (only for authenticated users)
    if (!isGuest) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: req.file.size },
      });
    }

    res.status(201).json({ message: 'File uploaded successfully', file });
  } catch (error) {
    // Clean up file if DB save fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

// Upload chunk
exports.uploadChunk = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, originalName, mimeType, totalSize, folder } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No chunk data provided' });
    }

    const chunkIdx = parseInt(chunkIndex);
    const total = parseInt(totalChunks);

    // Check if all chunks uploaded
    if (chunkIdx === total - 1) {
      // Merge chunks
      const userDir = path.join(uploadDir, req.user._id.toString());
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      const ext = path.extname(originalName);
      const storedName = `${uuidv4()}${ext}`;
      const finalPath = path.join(userDir, storedName);
      const writeStream = fs.createWriteStream(finalPath);

      const chunkDir = path.join(uploadDir, 'chunks', req.user._id.toString());

      for (let i = 0; i < total; i++) {
        const chunkPath = path.join(chunkDir, `${uploadId}_chunk_${i}`);
        if (fs.existsSync(chunkPath)) {
          const data = fs.readFileSync(chunkPath);
          writeStream.write(data);
          fs.unlinkSync(chunkPath);
        }
      }

      writeStream.end();

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const stats = fs.statSync(finalPath);

      const file = await File.create({
        originalName,
        storedName,
        mimeType,
        size: stats.size,
        path: finalPath,
        user: req.user._id,
        folder: folder || null,
        shareLink: uuidv4(),
        totalChunks: total,
        uploadedChunks: total,
        uploadComplete: true,
      });

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: stats.size },
      });

      return res.status(201).json({
        message: 'File uploaded successfully',
        file,
        complete: true,
      });
    }

    res.json({
      message: `Chunk ${chunkIdx + 1}/${total} uploaded`,
      chunkIndex: chunkIdx,
      complete: false,
    });
  } catch (error) {
    res.status(500).json({ message: 'Chunk upload failed', error: error.message });
  }
};

// Get user files
exports.getFiles = async (req, res) => {
  try {
    const { folder, search, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id, uploadComplete: true };

    if (folder) {
      query.folder = folder;
    } else if (!search) {
      query.folder = null;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('folder', 'name');

    const total = await File.countDocuments(query);

    res.json({
      files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single file
exports.getFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    await File.findByIdAndUpdate(file._id, { $inc: { downloads: 1 } });

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download by share link (public)
exports.downloadByShareLink = async (req, res) => {
  try {
    const file = await File.findOne({
      shareLink: req.params.shareLink,
      isPublic: true,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found or not shared' });
    }

    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    await File.findByIdAndUpdate(file._id, { $inc: { downloads: 1 } });

    res.download(file.path, file.originalName);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get file info by share link (public)
exports.getFileByShareLink = async (req, res) => {
  try {
    const file = await File.findOne({
      shareLink: req.params.shareLink,
      isPublic: true,
    }).select('originalName size mimeType downloads createdAt');

    if (!file) {
      return res.status(404).json({ message: 'File not found or not shared' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle share
exports.toggleShare = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.isPublic = !file.isPublic;
    if (!file.shareLink) {
      file.shareLink = uuidv4();
    }
    await file.save();

    res.json({
      message: file.isPublic ? 'File is now shared' : 'File is now private',
      file,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Move file to folder
exports.moveFile = async (req, res) => {
  try {
    const { folderId } = req.body;

    const file = await File.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    file.folder = folderId || null;
    await file.save();

    res.json({ message: 'File moved successfully', file });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Delete from disk
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // Update user storage
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { storageUsed: -file.size },
    });

    await File.findByIdAndDelete(file._id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
