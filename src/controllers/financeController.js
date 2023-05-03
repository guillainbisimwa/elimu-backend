const db  = require('../models');

module.exports = {
 
  addController: async (req, res) => {
    try {

      const { id_eleve, id_anneeScolaire } = req.body;
      const eleve = await db.Eleve.find({ eleve: new ObjectId(id_eleve) });
      const anneeScolaire = await db.AnneeScolaire.find({ anneeScolaire: new ObjectId(id_anneeScolaire) });
      if (!eleve)
        return res
          .status(403)
          .json({ success: false, msg: "Eleve doesn't exist" });

      if (!anneeScolaire)
      return res
        .status(403)
        .json({ success: false, msg: "Annee Scolaire doesn't exist" });

      const d = {
        montant: req.body.montant,
        anneeScolaire: req.body.anneeScolaire,
        eleve: req.body.eleve,
        datePayement: req.body.datePayement,
      };
      const finance = await db.Finance.create(d);
      await finance.save();
      res
        .status(200)
        .json({ success: true, msg: "Finance added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },
  getController: async (req, res) => {
    try {
      const finance = await db.Finance.find();
      if (!finance)
        return res
          .status(403)
          .json({ success: false, msg: "Finance doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Finance fetched successfully!",
        finance: finance,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },

}
