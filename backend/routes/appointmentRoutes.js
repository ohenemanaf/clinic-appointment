const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

router.get('/slots', appointmentController.getAvailableSlots);
router.post('/book', appointmentController.bookAppointment);
router.post('/staff-appointments', appointmentController.getStaffAppointments); // Using POST to easily pass userId from client since we don't have auth middleware yet
router.post('/slots/add', appointmentController.createTimeSlot);
router.post('/slots/bulk-add', appointmentController.bulkCreateTimeSlots);
router.post('/slots/staff-open', appointmentController.getStaffOpenSlots);
router.delete('/slots/:id', appointmentController.deleteTimeSlot);
router.put('/:id/cancel-by-staff', appointmentController.cancelByStaff);
router.put('/:id/approve', appointmentController.approveAppointment);
router.post('/student-appointments', appointmentController.getStudentAppointments);

module.exports = router;
