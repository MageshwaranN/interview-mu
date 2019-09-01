const mongoose = require('mongoose');

const Users = mongoose.Schema({
    name: String,
    email: String,
    mobile: Number,
    messages: [String]
})

const User = mongoose.model('User', Users);

module.exports = User;