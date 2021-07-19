const mongoose = require('mongoose');
module.exports = mongoose.model('logger', new mongoose.Schema({
    _id: String,
    type: String,
    userID: String,
    action: String,
    description: String,
    created: Date
}, { _id: false }));