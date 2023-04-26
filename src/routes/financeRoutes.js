const express = require("express");
const { addController, listFinance } = require("../controllers/financeController");
const router = express.Router();

router.post('/add', addController);

router.get("/all", (req, res) => {
    listFinance(req, res);
});

module.exports = router;
