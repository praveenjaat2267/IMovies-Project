const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movie.controller');
const { verifyAdmin } = require('../middleware/auth');

// Public catalog routes
router.get('/', movieController.getAllMovies);
router.get('/:id', movieController.getMovieById);

// Admin movie management routes
router.post('/', verifyAdmin, movieController.createMovie);
router.put('/:id', verifyAdmin, movieController.updateMovie);
router.delete('/:id', verifyAdmin, movieController.deleteMovie);

module.exports = router;
