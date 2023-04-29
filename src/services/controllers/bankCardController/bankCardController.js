const db  = require('../../../models');
const stripe = require('stripe')(process.env.SECRET_STRIPE_KEY);
const ObjectId = require('mongodb').ObjectId;

module.exports = {
  addController : async (req, res)=>{
    try {
      var expiryDate = req.body.expiryDate;

      const d = { 
        cardNumber: req.body.cardNumber,
        cardHolderName: req.body.cardHolderName,
        expiryDate: req.body.expiryDate,
        cvvCvc: req.body.cvvCvc,
        customer: req.body.customer,
        email: req.body.email,
      }

      const token = await stripe.tokens.create({
        card: {
          number: d.cardNumber,
          exp_month: expiryDate.split("/")[0],
          exp_year: expiryDate.split("/")[1],
          cvc: d.cvvCvc,
        },
      });
      // create stripe id
      const customerStripe = await stripe.customers.create({
          email: d.email,
          source: token.id
      });

      // console.log("id", id);
      // await db.Customer.findByIdAndUpdate(new ObjectId(id), { stripeCustomerId: customerStripe.id });
      // res.json({ success: true, msg: "Stripe Customer added successfully"  })

      const bankCard = await db.BankCard.create({
        stripeCardId: token.card.id,
        stripeCustomerId: customerStripe.id,
        stripeToken: token.id,
        customer: d.customer
      });
      console.log("bankCard", bankCard);
      await bankCard.save();

      res.status(200).json({success:true, msg: "BankCard added successfully", bankCard});

    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  // This function retrieves the bank card details for a given customer by mapping 
  // over the bank cards in the database and retrieving the last 4 digits

  getCardDetails: async function(req, res) {
    try {
      var id = req.params.id;
      const stripeCustomer  = await db.BankCard.find({'customer': id});
  
      if (stripeCustomer.length === 0) {
        return res.json({ success: false, msg: "User hasn't any Credit card" });
      }
  
      var cardList = await Promise.all(stripeCustomer.map(async(card)=>{
        const { default_source } = await stripe.customers.retrieve(card.stripeCustomerId);
        const { last4, brand } = await stripe.customers.retrieveSource(
          card.stripeCustomerId,
          default_source
        );
  
        return {...card._doc,  last4, brand} 
      }));
  
      return res.json({ success: true, cardList});
   
    } catch(err) {
      res.status(500).json({success: false, msg: err.message}); 
    }
  },

  deleteCard: async (req, res) => {
    try {
      const details = await db.BankCard.findById(req.params.id);

      const deleted = await stripe.customers.deleteSource(
        details.stripeCustomerId,
        details.stripeCardId
      );
      if (deleted.deleted) {
        await db.BankCard.findByIdAndDelete(req.params.id);
        return res.json({ success: true, msg: "Card deleted successfully" });
      }else{
        return res.json({ success: false, msg: "Error occured while deleting a card" });
      }
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message})
    }
  }
};
