const mongoose = require('mongoose');
module.exports = mongoose.model('backup_cc', new mongoose.Schema({
    _id: String,
    name: String,
    position: Number
}, { _id: false }));