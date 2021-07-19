const mongoose = require('mongoose');
module.exports = mongoose.model('backup_vc', new mongoose.Schema({
    _id: String,
    name: String,
    bitrate: Number,
    parentID: String,
    position: Number
}, { _id: false }));