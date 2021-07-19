const mongoose = require('mongoose');
module.exports = mongoose.model('backup_member', new mongoose.Schema({
    _id: String,
    roles: Array
}, { _id: false }));