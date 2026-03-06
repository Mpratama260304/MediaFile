const express = require('express');
const { body } = require('express-validator');
const {
  createFolder,
  getFolders,
  renameFolder,
  deleteFolder,
} = require('../controllers/folderController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Folder name is required').isLength({ max: 255 })],
  createFolder
);

router.get('/', getFolders);

router.patch(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Folder name is required').isLength({ max: 255 })],
  renameFolder
);

router.delete('/:id', deleteFolder);

module.exports = router;
