const mongoose = require('mongoose');
module.exports = mongoose.model('task_role', new mongoose.Schema({
    _id: String,
    requiredPoint: Number,
    passPoint: Number,
    expiresIn:  Number,
    minPoint: Number
}, { _id: false }));