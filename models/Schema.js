const mongoose = require('mongoose');

const Schema = mongoose.Schema({
    creator: String,
    name: String,
    avatar: String,
    comment: String,
    changed: Boolean,
    timeChanged: String,
    timeCreate: String,
    photo: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
})

module.exports = mongoose.model('comments', Schema)