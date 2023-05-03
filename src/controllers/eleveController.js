const db  = require('../models');

module.exports = {
 
  addController: async (req, res) => {
    try {

      const { id_parent, id_classe } = req.body;
      const parent = await db.Parent.find({ parent: new ObjectId(id_parent) });
      const classe = await db.Classe.find({ classe: new ObjectId(id_classe) });
      if (!parent)
        return res
          .status(403)
          .json({ success: false, msg: "Parent doesn't exist" });

      if (!classe)
      return res
        .status(403)
        .json({ success: false, msg: "Classe doesn't exist" });

      const d = {
        name: req.body.name,
        classe: req.body.classe,
        parent: req.body.parent,
      };
      const eleve = await db.Eleve.create(d);
      await eleve.save();
      res
        .status(200)
        .json({ success: true, msg: "Eleve added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  getController: async (req, res) => {
    try {
      const eleve = await db.Eleve.find();
      if (!eleve)
        return res
          .status(403)
          .json({ success: false, msg: "Eleve doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Eleve fetched successfully!",
        eleve: eleve,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
}
