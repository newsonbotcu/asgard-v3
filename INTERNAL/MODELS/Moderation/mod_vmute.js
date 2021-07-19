const mongoose = require('mongoose');
module.exports = mongoose.model('mod_vmute', new mongoose.Schema({
    _id: String,
    reason: String,
    executor: String,
    duration: Number,
    created: Date
}, { _id: false }));