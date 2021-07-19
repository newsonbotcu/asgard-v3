const mongoose = require('mongoose');
module.exports = mongoose.model('task_role', new mongoose.Schema({
    _id: String,
    nextLevel: String,
    requiredPoint: Number,
    passPoint: Number,
    expiresIn:  Number,
    minPoint: Number,
    tasks: Array
}, { _id: false }));