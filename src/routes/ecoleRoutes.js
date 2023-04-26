const express = require("express");
const { addController, listEcole } = require("../controllers/ecoleController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listEcole(req, res);
});

module.exports = router;
