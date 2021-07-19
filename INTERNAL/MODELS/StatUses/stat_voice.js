const mongoose = require('mongoose');
module.exports = mongoose.model('stat_voice', new mongoose.Schema({
    _id: String,
    records: Array
}, { _id: false }));