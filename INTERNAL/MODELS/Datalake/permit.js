const mongoose = require('mongoose');
module.exports = mongoose.model('permit', new mongoose.Schema({
    _id: String,
    user: String,
    executor: String,
    count: Number,
    type: String,
    effect: String,
    created: Date,
    time: Number
}, { _id: false }));