const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

router.post("/login", authController.login);

router.post("/register", authController.register);

router.get("/students", authController.getStudents);

// Forgot Password
router.post("/forgot-password", authController.forgotPassword);

// Reset Password
router.post("/reset-password", authController.resetPassword);

// User Profile Update Route
router.put("/profile/:id", authController.updateProfile);

router.put("/:id", authController.updateProfile);

module.exports = router;