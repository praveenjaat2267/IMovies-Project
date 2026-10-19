const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// User routes (Protected)
router.get('/user', verifyToken, bookingController.getUserBookings);
router.post('/', verifyToken, bookingController.createBooking);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);

// Admin routes (Protected)
router.get('/', verifyAdmin, bookingController.getAllBookings);

module.exports = router;
