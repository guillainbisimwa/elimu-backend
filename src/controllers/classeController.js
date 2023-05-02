const db  = require('../models');

module.exports = {
 
  addController: async (req, res) => {
    try {

      const { id_ecole, id_anneeScolaire } = req.body;
      const ecole = await db.Ecole.find({ ecole: new ObjectId(id_ecole) });
      const anneeScolaire = await db.AnneeScolaire.find({ anneeScolaire: new ObjectId(id_anneeScolaire) });
      if (!ecole)
        return res
          .status(403)
          .json({ success: false, msg: "Ecole doesn't exist" });

      if (!anneeScolaire)
      return res
        .status(403)
        .json({ success: false, msg: "Annee Scolaire doesn't exist" });

      const d = {
        name: req.body.name,
        anneeScolaire: req.body.anneeScolaire,
        ecole: req.body.ecole,
      };
      const classe = await db.Classe.create(d);
      await classe.save();
      res
        .status(200)
        .json({ success: true, msg: "Classe added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  getController: async (req, res) => {
    try {
      const classe = await db.Classe.find();
      if (!classe)
        return res
          .status(403)
          .json({ success: false, msg: "Classe doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Classe fetched successfully!",
        classe: classe,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
}
