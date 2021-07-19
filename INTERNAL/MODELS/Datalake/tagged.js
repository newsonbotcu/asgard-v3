const mongoose = require('mongoose');
module.exports = mongoose.model('tagged', new mongoose.Schema({
    _id: String,
    created: Date,
    claim: String
}, { _id: false }));