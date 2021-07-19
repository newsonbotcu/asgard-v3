const mongoose = require('mongoose');
module.exports = mongoose.model('task_current', new mongoose.Schema({
    _id: String,
    tasks: Array
}, { _id: false }));