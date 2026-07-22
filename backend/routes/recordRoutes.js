const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

router.post('/add', recordController.createRecord);
router.get('/student/:studentId', recordController.getStudentRecords);

module.exports = router;
