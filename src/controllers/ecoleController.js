const jwt = require('jsonwebtoken');
const db  = require('../models');


module.exports = {
 
  addController: async (req, res) => {
    try {

      const d = {
        name: req.body.name,
        phones: req.body.phones,
        imgUrl: req.body.imgUrl,
      };
      const ecole = await db.Ecole.create(d);
      await ecole.save();
      res
        .status(200)
        .json({ success: true, msg: "Ecole added successfully" });
    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  getController: async (req, res) => {
    try {
      const ecole = await db.Ecole.find();
      if (!ecole)
        return res
          .status(403)
          .json({ success: false, msg: "Ecole doesn't exist" });

      res.status(200).json({
        success: true,
        msg: "Ecole fetched successfully!",
        ecole: ecole,
      });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  },
}
