const mongoose = require("mongoose");
 
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    studentId: {
    type: String,
    unique: true
},

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["Student", "Teacher"],
        default: "Student"
        
    },

    branch: {
        type: String,
        default: "CSE"
    },

    avg: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ["Active", "At Risk", "Inactive"],
        default: "Active"
    }

}, {
    timestamps: true
});

const User = mongoose.model("User", userSchema);

module.exports = User;