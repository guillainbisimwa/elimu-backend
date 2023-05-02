const express = require("express");
const { addController, getController } = require("../controllers/eleveController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    getController(req, res);
});

module.exports = router;
