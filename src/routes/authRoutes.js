const express = require("express");
const { loginController } = require("../controllers/authController"); 
const router = express.Router();

router.post('/login', loginController  );

module.exports = router;
