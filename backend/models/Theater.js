const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
    screenNumber: { 
        type: Number, 
        required: [true, 'Screen number is required'],
        min: 1 
    },
    screenType: { 
        type: String, 
        enum: ['2D', '3D', 'IMAX 3D', '4DX'], 
        default: '2D' 
    },
    totalSeats: { 
        type: Number, 
        default: 40,
        min: 10 
    }
});

const theaterSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Theater name is required'], 
        trim: true,
        maxlength: [100, 'Theater name cannot exceed 100 characters']
    },
    city: { 
        type: String, 
        required: [true, 'City is required'], 
        trim: true 
    },
    address: { 
        type: String, 
        trim: true,
        default: 'Central Cinema Complex, Downtown'
    },
    screens: [screenSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Theater', theaterSchema);
