const mongoose = require('mongoose');
module.exports = mongoose.model('staff_appeal', new mongoose.Schema({
    _id: String,
    type: String,
    created: Date
}, { _id: false }));