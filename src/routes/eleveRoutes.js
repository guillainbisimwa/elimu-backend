const express = require("express");
const { addController, listEleve } = require("../controllers/eleveController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listEleve(req, res);
});

module.exports = router;
