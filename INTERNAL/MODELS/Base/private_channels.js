const mongoose = require('mongoose');
module.exports = mongoose.model('private_channels', new mongoose.Schema({
    _id: String,
    type: String,
    owner: String
}, { _id: false }));