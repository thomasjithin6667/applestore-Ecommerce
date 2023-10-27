const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true,
        default:"userporfile.png"
    },
    email: {
        type: String,
        require: true,
    },
    mobile: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true
    },
    is_verified: {
        type: Number,
        default: 0,
    },

    is_Admin: {
        type: Number,
        required: true,
        default: 0
    },
  
    isBlocked: {
        type: Boolean,
        require: true,
        default: false,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    walletBalance: {
        type: Number,
        default: 0,
    },

});


module.exports = mongoose.model('User', userSchema);