const mongoose = require('mongoose');
module.exports = mongoose.model('personel', new mongoose.Schema({
    _id: String,
    created: Date,
    claim: String,
    role: String,
    started: Date
}, { _id: false }));