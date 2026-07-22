const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

router.put('/:id', studentController.updateProfile);

module.exports = router;
