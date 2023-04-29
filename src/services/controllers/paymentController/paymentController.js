const db  = require('../../../models');
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);

module.exports = {

  chargeStripeCustomer: async (req, res)=> {
    try {      
      const { amount, id_service, id_customer, stripe_customer_id } = req.body;
      const stripeCustomer  = await db.BankCard.find({'customer': id_customer});

      if (stripeCustomer.length === 0) {
        return res.json({ success: false, msg: "User hasn't any Credit card" });
      }

      const service = await db.Service.findById(id_service);
  
      const charge = await stripe.charges.create({
        amount: amount * 100,
        currency: 'usd',
        customer: stripe_customer_id, 
        description: service.serviceName,
      });

      //save in payment table
      const payment = await db.Payment.create({status: "completed", idStripeCharge: charge.id, idService: id_service , idCustomer: id_customer, amount });
      console.log("service", payment);
      await service.save();
     
      res.json({ success: true, msg:"Payment passed successfully", charge});
    } catch(err) {
      console.log(err);
      res.status(500).json({success: false, msg: err.message});    
    }
  },

    // get payments
    listPyments : async (req, res)=>{
      try {
      const payments = await db.Payment.find({});

      res.status(200).json({success: true, msg: "Payments fetched successfully", payments: payments});
  
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, msg:err.message });
      }
    },


// GET /v1/charges/:id
// const stripe = require('stripe')('sk_test_your_key');

// const charge = await stripe.charges.retrieve(
//   'ch_3MZMbQDSebOil4xL0n7dbJnk'
// );

// Retrieves the details of a charge that has previously been created. 
// Supply the unique charge ID that was returned from your previous request, 
// and Stripe will return the corresponding charge information. 
// The same information is returned when creating or refunding the charge.


// GET /v1/charges/
// const stripe = require('stripe')('sk_test_your_key');

// const charges = await stripe.charges.list({
//   limit: 3,
// });
};
