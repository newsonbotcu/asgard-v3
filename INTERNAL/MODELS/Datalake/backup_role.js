const mongoose = require('mongoose');
module.exports = mongoose.model('backup_role', new mongoose.Schema({
    _id: String,
    name: String,
    color: String,
    hoist: Boolean,
    mentionable: Boolean,
    rawPosition: Number,
    bitfield: Number
}, { _id: false }));