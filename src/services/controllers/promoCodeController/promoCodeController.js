const db  = require('../../../models');

module.exports = {
  addController : async (req, res)=>{
    try {
      const d = { amount: req.body.amount, code: req.body.code, expireDate: req.body.expireDate}
      const promoCode = await db.PromoCode.create(d);
      console.log("PromoCode", promoCode);
      await promoCode.save();
      res.status(200).json({success:true, msg: "PromoCode added successfully"});

    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  //get PromoCodes
  listPromoCodes : async (req, res)=>{
    try {
    const promoCodes = await db.PromoCode.find({});
    res.status(200).json({success: true, msg: "PromoCode fetched successfully", promoCodes: promoCodes});

    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  findPromoCode : async (req, res)=>{
    try{
      const code = req.params.code;
      const promoCode = await db.PromoCode.find({"code": code});
      console.log(promoCode);
      if(promoCode.length == 0) return res.status(403).json({success: false, msg:"PromoCode not found"});
      res.status(200).json({success:true, msg: "PromoCode found", promoCode: promoCode });
    } catch(err) {
      res.status(500).json({ success: false, msg:err.message })
    } 
  }
};
