const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    googleId: {
        type: String, 
        required: true, 
        unique: true
    }, 
    email: String,
    name: String, 
    picture: String, 
});

//creates a class named users with the blueprint of a user schema. Using this class, you can now add documents to this
const User = mongoose.model('User', userSchema);

module.exports = User;