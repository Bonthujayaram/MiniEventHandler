const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: String, // Storing as string to match frontend 'YYYY-MM-DD' for simplicity
        required: true,
    },
    time: {
        type: String, // 'HH:MM'
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        default: '',
    },
    capacity: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    creatorName: {
        type: String,
        required: true,
    },
    attendees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Event', eventSchema);
