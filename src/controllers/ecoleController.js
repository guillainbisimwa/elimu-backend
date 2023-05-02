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

}
