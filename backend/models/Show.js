const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
    movie: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Movie', 
        required: [true, 'Movie reference is required for a show'] 
    },
    theater: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Theater', 
        required: [true, 'Theater reference is required for a show'] 
    },
    screenNumber: { 
        type: Number, 
        default: 1,
        min: 1 
    },
    showTime: { 
        type: String, 
        required: [true, 'Show time is required (e.g. 10:00 AM, 02:30 PM)'],
        trim: true 
    },
    showDate: { 
        type: Date, 
        required: [true, 'Show date is required'],
        default: Date.now 
    },
    ticketPrice: { 
        type: Number, 
        required: [true, 'Base ticket price is required'],
        min: [50, 'Ticket price cannot be less than 50'],
        default: 150 
    },
    bookedSeats: { 
        type: [String], 
        default: [] 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Show', showSchema);
