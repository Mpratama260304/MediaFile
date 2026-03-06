const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      unique: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null,
    },
    shareLink: {
      type: String,
      unique: true,
      sparse: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    // For chunked upload tracking
    uploadComplete: {
      type: Boolean,
      default: true,
    },
    totalChunks: {
      type: Number,
      default: 1,
    },
    uploadedChunks: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
fileSchema.index({ originalName: 'text' });
fileSchema.index({ user: 1, folder: 1 });

module.exports = mongoose.model('File', fileSchema);
