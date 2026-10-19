const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theater.controller');
const { verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', theaterController.getAllTheaters);
router.get('/:id', theaterController.getTheaterById);

// Admin routes
router.post('/', verifyAdmin, theaterController.createTheater);
router.delete('/:id', verifyAdmin, theaterController.deleteTheater);

module.exports = router;
