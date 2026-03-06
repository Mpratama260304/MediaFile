const express = require('express');
const {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getAllFiles,
  deleteAnyFile,
} = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(auth, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/files', getAllFiles);
router.delete('/files/:id', deleteAnyFile);

module.exports = router;
