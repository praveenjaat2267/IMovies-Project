const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User reference is required'] 
    },
    userName: { 
        type: String, 
        required: [true, 'User name is required'],
        trim: true 
    },
    movieId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: [true, 'Movie reference is required'] 
    },
    rating: { 
        type: Number, 
        required: [true, 'Rating is required (1-5)'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'] 
    },
    comment: { 
        type: String, 
        required: [true, 'Review comment is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'] 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Review', reviewSchema);
