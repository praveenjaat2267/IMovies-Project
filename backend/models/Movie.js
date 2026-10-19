const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Movie title is required'], 
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        default: 'Experience this thrilling movie at IMovies Cinemas with cutting-edge Dolby Atmos sound and IMAX visual immersion.'
    },
    genre: { 
        type: [String], 
        required: [true, 'At least one genre is required'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'A movie must have at least one genre'
        }
    },
    language: { 
        type: String, 
        required: [true, 'Language is required'],
        default: 'English', 
        trim: true 
    },
    duration: { 
        type: Number, 
        required: [true, 'Duration in minutes is required'],
        min: [1, 'Duration must be at least 1 minute'],
        max: [600, 'Duration cannot exceed 600 minutes']
    },
    rating: {
        type: Number,
        min: [0, 'Rating cannot be negative'],
        max: [10, 'Rating cannot exceed 10'],
        default: 8.5
    },
    posterUrl: { 
        type: String, 
        default: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80' 
    },
    trailerUrl: {
        type: String,
        default: 'https://www.youtube.com'
    },
    releaseDate: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Movie', movieSchema);