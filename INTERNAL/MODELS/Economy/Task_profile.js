const mongoose = require('mongoose');
module.exports = mongoose.model('task_profile', new mongoose.Schema({
    _id: String,
    role: String,
    done: Array,
    active: Array,
    created: Date,
    started: Date,
    excuses: Array,
}, { _id: false }));