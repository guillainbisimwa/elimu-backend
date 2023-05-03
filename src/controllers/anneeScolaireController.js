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
  },

  getController: async (req, res) => {
    try {
      const anneeScolaire = await db.AnneeScolaire.find();
      if (!anneeScolaire)
        return res
          .status(403)
          .json({ success: false, msg: "Annee Scolaire doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Annee Scolaire fetched successfully!",
        anneeScolaire: anneeScolaire,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
}
