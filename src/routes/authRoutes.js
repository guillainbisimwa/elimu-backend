const express = require("express");
const { registerController, loginPhoneController } = require("../controllers/authController");
const router = express.Router();

router.post('/register',registerController);
router.post('/login',loginPhoneController);

module.exports = router;
