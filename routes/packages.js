const express = require('express');
const router = express.Router();
const {
  getAllPackages,
  getMyPackages,
  createPackage,
  assignPackage,
  updateStatus
} = require('../controllers/packageController');

const { verifyToken, requireRole } = require('../middleware/auth');

// Admin
router.get('/', verifyToken, requireRole('admin'), getAllPackages);
router.post('/', verifyToken, createPackage);
router.put('/assign', verifyToken, requireRole('admin'), assignPackage);

// Delivery
router.get('/my', verifyToken, requireRole('delivery'), getMyPackages);
router.put('/status', verifyToken, requireRole('delivery'), updateStatus);

module.exports = router;
