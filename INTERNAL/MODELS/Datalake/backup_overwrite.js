const mongoose = require('mongoose');
module.exports = mongoose.model('backup_overwrite', new mongoose.Schema({
    _id: String,
    overwrites: Array
}, { _id: false }));