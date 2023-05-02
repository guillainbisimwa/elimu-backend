const db  = require('../models');

module.exports = {
 
  addController: async (req, res) => {
    try {

      const d = {
        pseudo: req.body.pseudo,
        name: req.body.name,
        phones: req.body.phones,
        address: req.body.address,
        imgUrl: req.body.imgUrl,
      };
      const parent = await db.Parent.create(d);
      await parent.save();
      res
        .status(200)
        .json({ success: true, msg: "Parent added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  getController: async (req, res) => {
    try {
      const parent = await db.Parent.find();
      if (!parent)
        return res
          .status(403)
          .json({ success: false, msg: "Parent doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Parent fetched successfully!",
        parent: parent,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
}
