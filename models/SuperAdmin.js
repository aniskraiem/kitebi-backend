const mongoose = require('mongoose');

const SuperAdminSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },
    numlib: {
        type: String,
        required: true,

    },
    avatar: {
        type: String,
    },
    typeuser: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },

});

module.exports = SuperAdmin = mongoose.model('superadmin', SuperAdminSchema);