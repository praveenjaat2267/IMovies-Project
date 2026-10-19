const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    bookingId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Booking', 
        required: [true, 'Booking ID is required'] 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'User ID is required'] 
    },
    transactionId: { 
        type: String, 
        required: [true, 'Transaction ID is required'],
        unique: true,
        trim: true 
    },
    amount: { 
        type: Number, 
        required: [true, 'Payment amount is required'],
        min: [0, 'Amount cannot be negative'] 
    },
    paymentMethod: { 
        type: String, 
        enum: ['Card', 'UPI', 'NetBanking', 'Wallet'], 
        default: 'UPI' 
    },
    status: { 
        type: String, 
        enum: ['Success', 'Failed', 'Pending', 'Refunded'], 
        default: 'Success' 
    },
    paidAt: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
