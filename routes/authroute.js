const express = require("express");
const authController = require('../controllers/authcontroller')
const requireLogin = require('../middleware/requireLogin')
const router = express.Router();

router.post("/login", authController.login);
router.post('/forgetpassword', authController.forgetpassword)
module.exports = router;