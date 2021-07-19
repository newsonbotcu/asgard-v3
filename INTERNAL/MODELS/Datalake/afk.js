const mongoose = require('mongoose');
module.exports = mongoose.model('afk', new mongoose.Schema({
    _id: String,
    reason: String,
    created: Date,
    inbox: Array
}, { _id: false }));