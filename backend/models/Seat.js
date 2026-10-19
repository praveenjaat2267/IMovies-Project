const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
    seatNumber: { 
        type: String, 
        required: [true, 'Seat number is required (e.g. A1, B3)'],
        trim: true,
        uppercase: true 
    },
    row: { 
        type: String, 
        required: [true, 'Row identifier is required (e.g. A, B, C)'],
        trim: true,
        uppercase: true 
    },
    seatType: { 
        type: String, 
        enum: {
            values: ['Standard', 'Premium', 'VIP'],
            message: '{VALUE} is not a valid seat type'
        }, 
        default: 'Standard' 
    },
    priceMultiplier: {
        type: Number,
        default: 1.0,
        min: 0.5
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Seat', seatSchema);
