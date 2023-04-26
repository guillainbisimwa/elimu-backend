const express = require("express");
const { addController, listClasse } = require("../controllers/classeController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listClasse(req, res);
});

module.exports = router;
