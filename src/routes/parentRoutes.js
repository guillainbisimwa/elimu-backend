const express = require("express");
const { addController, listParents } = require("../controllers/parentController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listParents(req, res);
});

module.exports = router;
