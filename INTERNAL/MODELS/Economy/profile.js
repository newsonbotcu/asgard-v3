const mongoose = require('mongoose');
module.exports = mongoose.model('profile', new mongoose.Schema({
    _id: String,
    coin: Number,
    badges: Array,
    xp: Number,
    points: Number,
    created: Date
}, { _id: false }));