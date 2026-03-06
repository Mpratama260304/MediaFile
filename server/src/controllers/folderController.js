const Folder = require('../models/Folder');
const File = require('../models/File');
const User = require('../models/User');
const fs = require('fs');
const { validationResult } = require('express-validator');

// Create folder
exports.createFolder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, parent } = req.body;

    // Check for duplicate folder name in same parent
    const existing = await Folder.findOne({
      name,
      user: req.user._id,
      parent: parent || null,
    });

    if (existing) {
      return res.status(400).json({ message: 'Folder with this name already exists' });
    }

    const folder = await Folder.create({
      name,
      user: req.user._id,
      parent: parent || null,
    });

    res.status(201).json({ message: 'Folder created', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get folders
exports.getFolders = async (req, res) => {
  try {
    const { parent } = req.query;

    const folders = await Folder.find({
      user: req.user._id,
      parent: parent || null,
    }).sort({ name: 1 });

    res.json({ folders });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Rename folder
exports.renameFolder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    folder.name = req.body.name;
    await folder.save();

    res.json({ message: 'Folder renamed', folder });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete folder (and all contents)
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Delete all files in folder
    const files = await File.find({ folder: folder._id, user: req.user._id });
    let freedSpace = 0;

    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      freedSpace += file.size;
    }

    await File.deleteMany({ folder: folder._id, user: req.user._id });

    // Delete sub-folders recursively
    await deleteFolderRecursive(folder._id, req.user._id);

    // Update user storage
    if (freedSpace > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { storageUsed: -freedSpace },
      });
    }

    await Folder.findByIdAndDelete(folder._id);

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper: recursively delete sub-folders
async function deleteFolderRecursive(parentId, userId) {
  const subFolders = await Folder.find({ parent: parentId, user: userId });

  for (const sub of subFolders) {
    const files = await File.find({ folder: sub._id, user: userId });
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    await File.deleteMany({ folder: sub._id, user: userId });
    await deleteFolderRecursive(sub._id, userId);
    await Folder.findByIdAndDelete(sub._id);
  }
}
