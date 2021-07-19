const mongoose = require('mongoose');
module.exports = mongoose.model('xp_channel', new mongoose.Schema({
    _id: String,
    digit: Number,
    selfMute: Number,
    serverMute: Number,
    selfDeaf: Number,
    serverDeaf: Number,
    videoOn: Number,
    streaming: Number
}, { _id: false }));