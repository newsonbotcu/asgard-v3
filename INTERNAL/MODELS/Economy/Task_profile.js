const mongoose = require('mongoose');
module.exports = mongoose.model('task_profile', new mongoose.Schema({
    _id: String,
    role: String,
    done: Array,
    active: Array,
    created: Date,
    started: Date
}, { _id: false }));