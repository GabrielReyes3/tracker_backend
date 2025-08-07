const express = require('express');
const router = express.Router();
const { saveLocation, getLastLocations } = require('../controllers/locationController');
const { verifyToken, requireRole } = require('../middleware/auth');

// Solo el delivery puede guardar su ubicación
router.post('/', verifyToken, requireRole('delivery'), saveLocation);

// El admin puede consultar las últimas ubicaciones de todos
router.get('/', verifyToken, requireRole('admin'), getLastLocations);

module.exports = router;
