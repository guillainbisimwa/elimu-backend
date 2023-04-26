const express = require("express");
const { addController, listCommunique } = require("../controllers/communiqueController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listCommunique(req, res);
});

module.exports = router;
