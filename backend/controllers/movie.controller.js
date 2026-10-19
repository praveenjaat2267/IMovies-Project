const Movie = require('../models/Movie');

// @desc    Get all movies with optional filters (search, genre, language)
// @route   GET /api/movies
// @access  Public
exports.getAllMovies = async (req, res, next) => {
    try {
        const { search, genre, language, sort } = req.query;
        let query = {};

        if (search) {
            query.title = { $regex: search.trim(), $options: 'i' };
        }
        if (genre && genre !== 'All') {
            query.genre = { $in: [new RegExp(genre.trim(), 'i')] };
        }
        if (language && language !== 'All') {
            query.language = { $regex: language.trim(), $options: 'i' };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };
        if (sort === 'duration') sortOption = { duration: 1 };
        if (sort === 'title') sortOption = { title: 1 };

        const movies = await Movie.find(query).sort(sortOption);
        res.json(movies);
    } catch (err) {
        next(err);
    }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res, next) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ msg: 'Movie not found' });
        }
        res.json(movie);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Movie not found' });
        }
        next(err);
    }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res, next) => {
    try {
        let { title, description, genre, language, duration, rating, posterUrl, trailerUrl, releaseDate } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ msg: 'Movie title is required' });
        }
        if (!duration || Number(duration) <= 0) {
            return res.status(400).json({ msg: 'Duration must be a positive number in minutes' });
        }

        // Format genre: supports array or comma-separated string
        let formattedGenre = ['General'];
        if (Array.isArray(genre) && genre.length > 0) {
            formattedGenre = genre.map(g => g.trim()).filter(Boolean);
        } else if (typeof genre === 'string' && genre.trim()) {
            formattedGenre = genre.split(',').map(g => g.trim()).filter(Boolean);
        }

        const newMovie = new Movie({
            title: title.trim(),
            description: description && description.trim() ? description.trim() : undefined,
            genre: formattedGenre,
            language: language ? language.trim() : 'English',
            duration: Number(duration),
            rating: rating ? Number(rating) : 8.5,
            posterUrl: posterUrl && posterUrl.trim() ? posterUrl.trim() : undefined,
            trailerUrl: trailerUrl && trailerUrl.trim() ? trailerUrl.trim() : undefined,
            releaseDate: releaseDate ? new Date(releaseDate) : new Date()
        });

        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
    } catch (err) {
        next(err);
    }
};

// @desc    Update an existing movie
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res, next) => {
    try {
        let { title, description, genre, language, duration, rating, posterUrl, trailerUrl, releaseDate } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (language !== undefined) updateData.language = language.trim();
        if (duration !== undefined) updateData.duration = Number(duration);
        if (rating !== undefined) updateData.rating = Number(rating);
        if (posterUrl !== undefined) updateData.posterUrl = posterUrl.trim();
        if (trailerUrl !== undefined) updateData.trailerUrl = trailerUrl.trim();
        if (releaseDate !== undefined) updateData.releaseDate = new Date(releaseDate);

        if (genre !== undefined) {
            if (Array.isArray(genre)) {
                updateData.genre = genre.map(g => g.trim()).filter(Boolean);
            } else if (typeof genre === 'string') {
                updateData.genre = genre.split(',').map(g => g.trim()).filter(Boolean);
            }
        }

        const updatedMovie = await Movie.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedMovie) {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        res.json(updatedMovie);
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Movie not found' });
        }
        next(err);
    }
};

// @desc    Delete a movie
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res, next) => {
    try {
        const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
        if (!deletedMovie) {
            return res.status(404).json({ msg: 'Movie not found' });
        }
        res.json({ msg: 'Movie deleted successfully', deletedId: req.params.id });
    } catch (err) {
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Movie not found' });
        }
        next(err);
    }
};
