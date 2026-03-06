const express = require('express');
const {
  uploadFile,
  uploadChunk,
  getFiles,
  getFile,
  downloadFile,
  downloadByShareLink,
  getFileByShareLink,
  toggleShare,
  moveFile,
  deleteFile,
} = require('../controllers/fileController');
const { auth, optionalAuth } = require('../middleware/auth');
const { upload, chunkUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (shared files)
router.get('/shared/:shareLink', getFileByShareLink);
router.get('/shared/:shareLink/download', downloadByShareLink);

// Guest-accessible upload (rate limited, optional auth to link to user if logged in)
router.post('/upload', optionalAuth, uploadLimiter, upload.single('file'), uploadFile);
router.post('/upload/chunk', optionalAuth, uploadLimiter, chunkUpload.single('chunk'), uploadChunk);

// Protected routes
router.use(auth);
router.get('/', getFiles);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.patch('/:id/share', toggleShare);
router.patch('/:id/move', moveFile);
router.delete('/:id', deleteFile);

module.exports = router;
