const express = require('express');
const router = express.Router();
const showController = require('../controllers/show.controller');
const { verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', showController.getAllShows);
router.get('/movie/:movieId', showController.getShowsByMovie);
router.get('/:id', showController.getShowById);

// Admin routes
router.post('/', verifyAdmin, showController.createShow);
router.delete('/:id', verifyAdmin, showController.deleteShow);

module.exports = router;
