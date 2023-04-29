const axios = require("axios");
const db = require("../../../models");
var ObjectId = require("mongodb").ObjectId;


module.exports = {
  customerDetail: async (req, res) => {
    const id = req.params.id;
    try {

      const customer = await db.customer.find({
        _id: id,
      });

      const account = await db.Account.find(
        {"roleData": {"customer": new ObjectId(id)}}
      );
      
      if (customer.length !== 0 ) {
        return res.status(200).json({
          success: true,
          msg: `Customer Details for ${req.params.id} fetched successfully`,
          customer: {customer, account},
        });
      };

      return res.status(200).json({success:false, msg: "Account doesn't exist"}); 
     
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },

  customerByEmail: async (req, res) => {
    const email = req.params.email;
    try{
      const account = await db.Account.findOne({email: email});
      if(!account) return res.status(403).json({success:false, msg:"Email doesn't exist"});

      console.log("account", account);
      
      const customer = await db.customer.find({
        _id: account._id,
      });
      
      if (customer != null) {
        return res.status(200).json({
          success: true,
          msg: `Customer Details for ${email} fetched successfully`,
          customer: {customer, account},
        });
      };

      return res.status(200).json({success:false, msg: "Account doesn't exist"}); 
     
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg: err.message });
    }
  },
  
  deleteCustomer : async (req, res)=> {
    try {
      var id = req.params.id;

      // Delete the customer's associated data

      const customer = await db.customer.findOneAndDelete({
        _id: id,
      });

      await db.Account.findOneAndDelete(
        {"roleData": {"customer": new ObjectId(id)}}
      );

      const filter = { customer: new ObjectId(id) };
      await db.Booking.deleteMany(filter);

      if (customer !== null ) {
        return res.status(200).json({success:true, msg: "Account deleted"});
      };

      return res.status(200).json({success:false, msg: "Account doesn't exist"}); 

    } catch (err) {
      res.status(500).json({ success: false, msg:err.message })
    }
  }
};
