const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User ID is required for a booking'] 
    },
    movieId: { 
        type: String, 
        required: [true, 'Movie ID is required'] 
    },
    movieTitle: { 
        type: String, 
        required: [true, 'Movie Title is required'],
        trim: true 
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater'
    },
    theaterName: {
        type: String,
        default: 'IMovies Grand Screen',
        trim: true
    },
    showId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Show'
    },
    showTime: {
        type: String,
        default: '07:30 PM'
    },
    showDate: {
        type: Date,
        default: Date.now
    },
    seats: { 
        type: [String], 
        required: [true, 'Seats selection is required'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'You must select at least one seat'
        }
    },
    totalAmount: { 
        type: Number, 
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Pending'],
        default: 'Confirmed'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Refunded'],
        default: 'Paid'
    },
    paymentMethod: {
        type: String,
        default: 'UPI / Credit Card'
    },
    bookingReference: {
        type: String,
        default: function() {
            return 'IMV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);