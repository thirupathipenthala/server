const express = require("express");
const authController = require('../controllers/authcontroller')
// const requireLogin = require('../middleware/requireLogin')
const router = express.Router();

/**
 * login
 */
router.post("/login", authController.login);
/**
 * forget password
 */
router.post('/forget-password', authController.forgetpassword)


module.exports = router;