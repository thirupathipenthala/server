const express = require("express");
const authController = require('../controllers/authcontroller')
// const requireLogin = require('../middleware/requireLogin')
const router = express.Router();

/**
 * get device firmware
 */
router.get('/get-device-firmware', authController.getDeviceFirmware);

/**
 * delete device firmware
 */
router.delete('/delete-device-firmware/:id', authController.deleteFirmware);

/**
 * view device firmware
 */
router.get('/view-device-firmware/:id', authController.viewFirmware);
/**
 * fotafirmware uplode
 */
router.post('/fota-Firmware-uplode', authController.firmwareUplode);

module.exports = router;