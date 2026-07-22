const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/stats', adminController.getDashboardStats);
router.post('/staff', adminController.addStaff);

module.exports = router;
