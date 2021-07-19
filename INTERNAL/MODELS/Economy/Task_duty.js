const mongoose = require('mongoose');
module.exports = mongoose.model('task_duty', new mongoose.Schema({
    _id: String,
    roleID: String,
    type: String,
    count: Number,
    points: Number
}, { _id: false }));