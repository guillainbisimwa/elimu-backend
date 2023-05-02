const db  = require('../models');

module.exports = {
 
  addController: async (req, res) => {
    try {

      const { id_eleve, id_anneeScolaire, id_parent } = req.body;
      const eleve = await db.Eleve.find({ eleve: new ObjectId(id_eleve) });
      const parent = await db.Parent.find({ eleve: new ObjectId(id_parent) });
      const anneeScolaire = await db.AnneeScolaire.find({ anneeScolaire: new ObjectId(id_anneeScolaire) });
      if (!eleve)
        return res
          .status(403)
          .json({ success: false, msg: "Eleve doesn't exist" });

      if (!anneeScolaire)
      return res
        .status(403)
        .json({ success: false, msg: "Annee Scolaire doesn't exist" });

      if (!parent)
      return res
        .status(403)
        .json({ success: false, msg: "Parent doesn't exist" });

      const d = {
        motif: req.body.motif,
        anneeScolaire: req.body.anneeScolaire,
        eleve: req.body.eleve,
        parent: req.body.parent,
      };
      const communique = await db.Communique.create(d);
      await communique.save();
      res
        .status(200)
        .json({ success: true, msg: "Communique added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },
  

}
