const bcrypt = require("bcryptjs");
const User = require("../models/User");

//----- Authentication Controller -----//
exports.login = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        res.status(200).json({
            message: "Login successful",  
            role: user.role, 
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
//----- Registration Controller -----//
const TEACHER_ACCESS_CODE = "TCH-786";    // Teacher access code for registration
exports.register = async (req, res) => {
    try {

       const {
    name,
    email,
    password,
    role,
    teacherCode
    } = req.body;
   
        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }
        
         
        // Validate Teacher Access Code
        if (role === "Teacher") {

            if (teacherCode !== TEACHER_ACCESS_CODE) {

             return res.status(400).json({
            message: "Invalid Teacher Access Code"
        });

            }

        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        res.status(201).json({
            message: "User registered successfully",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// 


// ----- Update Profile Controller -----//
const updateProfile = async (req, res) => {

    try {

        const { id } = req.params;

        const { name, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(

            id,

            {
                name,
                email
            },

            { returnDocument: 'after' }

        );

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ----- Get Students Controller -----//

exports.getStudents = async (req, res) => {

    try {

        const students = await User.find(
            { role: "Student" },
            {
                password: 0
            }
        );

        res.status(200).json(students);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ----- Forgot Password Controller -----//
exports.forgotPassword = async (req, res) => {

    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                message: "Email not found"
            });

        }

        res.status(200).json({
            message: "Email verified"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ----- Reset Password Controller -----//
exports.resetPassword = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {

            return res.status(404).json({
                message: "Email not found"
            });

        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            message: "Password updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    login: exports.login,
    register: exports.register,
    updateProfile: updateProfile,
    getStudents: exports.getStudents,
    forgotPassword: exports.forgotPassword,
    resetPassword: exports.resetPassword
};