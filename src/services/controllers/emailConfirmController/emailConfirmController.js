const db  = require('../../../models');
var ObjectId = require('mongodb').ObjectId;

var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API;

module.exports = {
  sendController : async (req, res)=>{
    try {
      let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
      let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

      sendSmtpEmail.subject = "Splasheroo - Email Confirmation";
      sendSmtpEmail.htmlContent = '<!DOCTYPE html> <html lang="en"> <head> <meta charset="utf-8" /> <title>Splashero</title> <meta name="viewport" content="width=device-width, initial-scale=1" /> <link href="https://cdn.jsdelivr.net/npm/bootstrap@4.4.1/dist/css/bootstrap.min.css" rel="stylesheet" /> </head> <body> <div class="container"> <div class="content-wrapper"> <div class="email-app card-margin"> <div class="email-desc-wrapper"> <div class="email-header"> <div class="email-date">{{params.date}}</div> <h2 class="email-subject bold">Dear {{params.name}},</h2> </div> <div class="email-body"> <p> Thank you for signing up for our service! </p> <p>To complete the registration process and secure your account, please verify your email address by clicking the link below:</p> <p> <a href="https://splasheroo-backend.herokuapp.com/api/email/?{{params.id}}" target="_blank" style=" background: #00bcd4; margin: 0px; padding: 10px; border-radius: 10px; text-decoration: none; color: white; ">VEFIFY NOW</a> </p> <p> This link will expire in 24 hours. If you didnt sign up for our service or if you have any questions, please reply to this email.</p> <p> Thanks &amp; Regards <br /> The Slpasheroo Team</p> </div> </div> </div> </div> </div> </body> </html>';
      sendSmtpEmail.sender = {"name":"Splasheroo","email":"splasheroo.tech@gmail.com"};
      sendSmtpEmail.to = [{"email":req.body.email,"name":req.body.name}];
      sendSmtpEmail.cc = [{"email":"splasheroo.tech@gmail.com","name":"Splasheroo"}];

      sendSmtpEmail.replyTo = {"email":"splasheroo.tech@gmail.com","name":"Splasheroo"};
      sendSmtpEmail.headers = {'api-key': process.env.SENDINBLUE_API};
      sendSmtpEmail.params = {
          "email": req.body.email,
          "date": req.body.date,
          "name": req.body.name,
          "id": req.body.id,
      };

      apiInstance.sendTransacEmail(sendSmtpEmail).then((data)=> {
      console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      
      res.status(200).json({success:true, msg: "Email sent successfuly!"});

      }).catch(err =>  res.status(404).json({success:false, msg: "Faild to send an Email!"}) );

    } catch (err) {
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  checkEmailValidationController : async function(req, res){
    try{
      const {email} = req.body;
      const account = await db.Account.findOne({email: email}).select('+password');
      if(!account) return res.status(403).json({success:false, msg:"Email doesn't exist"});
      if (account.completedProfile) {
        res.status(200).json({success: true, msg: "Email validated"});
      }else{
        res.status(403).json({success: false, msg: "Email is not validated"});
      }
    } catch(err) {
      res.status(500).json({ success: false, msg:err.message })
    } 
  },

  // Received an ID
  validateEmail : async (req, res)=>{
    try{
      const {id} = req.body;
      const update = await db.Account.findOneAndUpdate({"roleData": {"customer": new ObjectId(id)}}, { completedProfile: true });
      if(!update) return res.status(403).json({success: false, msg:"Account doesn't exist"});

      res.status(200).json({success: true, msg: "Email validated successfully!"});
    } catch(err) {
      res.status(500).json({ success: false, msg:err.message })
    } 
  },
}
