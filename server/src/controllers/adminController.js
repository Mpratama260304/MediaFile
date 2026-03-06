const User = require('../models/User');
const File = require('../models/File');
const Folder = require('../models/Folder');
const fs = require('fs');

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalFiles = await File.countDocuments({ uploadComplete: true });

    const storageAgg = await File.aggregate([
      { $match: { uploadComplete: true } },
      { $group: { _id: null, totalSize: { $sum: '$size' } } },
    ]);
    const totalStorage = storageAgg.length > 0 ? storageAgg[0].totalSize : 0;

    const totalDownloads = await File.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } },
    ]);

    const recentFiles = await File.find({ uploadComplete: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // File type distribution
    const fileTypes = await File.aggregate([
      { $match: { uploadComplete: true } },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: '$mimeType', regex: /^image/ } },
              'Images',
              {
                $cond: [
                  { $regexMatch: { input: '$mimeType', regex: /^video/ } },
                  'Videos',
                  {
                    $cond: [
                      { $regexMatch: { input: '$mimeType', regex: /^audio/ } },
                      'Audio',
                      {
                        $cond: [
                          { $regexMatch: { input: '$mimeType', regex: /pdf|document|sheet|presentation|text/ } },
                          'Documents',
                          'Other',
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          count: { $sum: 1 },
          totalSize: { $sum: '$size' },
        },
      },
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalFiles,
        totalStorage,
        totalDownloads: totalDownloads.length > 0 ? totalDownloads[0].total : 0,
      },
      fileTypes,
      recentFiles,
      recentUsers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
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

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete user and their files
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete all user files from disk
    const files = await File.find({ user: user._id });
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

    await File.deleteMany({ user: user._id });
    await Folder.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    res.json({ message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all files (admin)
exports.getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { uploadComplete: true };

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const files = await File.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email');

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

// Delete any file (admin)
exports.deleteAnyFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await User.findByIdAndUpdate(file.user, {
      $inc: { storageUsed: -file.size },
    });

    await File.findByIdAndDelete(file._id);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
