const mongoose = require('mongoose');
module.exports = mongoose.model('membership', new mongoose.Schema({
    _id: String,
    executor: String,
    created: Date,
    name: String,
    age: Number,
    sex: String
}, { _id: false }));