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
const { auth } = require('../middleware/auth');
const { upload, chunkUpload } = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (shared files)
router.get('/shared/:shareLink', getFileByShareLink);
router.get('/shared/:shareLink/download', downloadByShareLink);

// Protected routes
router.use(auth);

router.post('/upload', uploadLimiter, upload.single('file'), uploadFile);
router.post('/upload/chunk', uploadLimiter, chunkUpload.single('chunk'), uploadChunk);
router.get('/', getFiles);
router.get('/:id', getFile);
router.get('/:id/download', downloadFile);
router.patch('/:id/share', toggleShare);
router.patch('/:id/move', moveFile);
router.delete('/:id', deleteFile);

module.exports = router;
