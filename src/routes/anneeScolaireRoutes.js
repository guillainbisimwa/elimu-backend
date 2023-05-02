const express = require("express");
const { addController } = require("../controllers/anneeScolaireController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listAnneeScolaire(req, res);
});

module.exports = router;
