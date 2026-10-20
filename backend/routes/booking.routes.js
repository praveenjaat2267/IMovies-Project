const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Admin routes (Protected) — MUST be before /:id wildcard
router.get('/', verifyAdmin, bookingController.getAllBookings);

// User routes (Protected) — static /user MUST be before /:id wildcard
router.get('/user', verifyToken, bookingController.getUserBookings);
router.post('/', verifyToken, bookingController.createBooking);
router.put('/:id/cancel', verifyToken, bookingController.cancelBooking);
router.get('/:id', verifyToken, bookingController.getBookingById);

module.exports = router;
