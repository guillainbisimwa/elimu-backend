const jwt = require('jsonwebtoken');
const db  = require('../models');


module.exports = {
 
  addController: async (req, res) => {
    try {

      const d = {
        name: req.body.name,
      };
      const anneeScolaire = await db.AnneeScolaire.create(d);
      await anneeScolaire.save();
      res
        .status(200)
        .json({ success: true, msg: "Annee Scolaire added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  }
}
