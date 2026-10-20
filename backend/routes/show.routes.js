const express = require('express');
const router = express.Router();
const showController = require('../controllers/show.controller');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

// Public routes
router.get('/', showController.getAllShows);
router.get('/movie/:movieId', showController.getShowsByMovie);

// Admin sync route — MUST be before /:id wildcard
router.post('/sync/:movieId', verifyAdmin, showController.syncShowsForMovie);

router.get('/:id', showController.getShowById);

// Seat Locking & Reservation routes
router.post('/:id/lock-seats', verifyToken, showController.lockSeats);
router.post('/:id/unlock-seats', verifyToken, showController.unlockSeats);

// Admin routes
router.post('/', verifyAdmin, showController.createShow);
router.delete('/:id', verifyAdmin, showController.deleteShow);

module.exports = router;
