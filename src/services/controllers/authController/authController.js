const jwt = require('jsonwebtoken');
const db  = require('../../../models');

module.exports = {
  // receive fullName, email and password
  registerController : async (req, res)=>{
    try {
      var parent = null;
      const checkAccount = await db.Account.findOne({email: req.body.email});

      if(checkAccount) return res.status(409).json({success:false, msg:"Account Already exist"});
      const d = { email: req.body.email, password: req.body.password, role: req.headers.role}
      const account = await db.Account.create(d);

      if (req.headers.role === 'parent') {
        parent = await db.Parent.create(
          {
            fullName: req.body.fullName,
            phone: req.body.phone,
            postCode : req.body.postCode,
            address : req.body.address,
          });

        if (parent) {
          account.roleData = { parent: parent._id };
          await Promise.all([parent.save(), account.save()]);
        } else {
          return res.status(500).json({ success: false, msg: 'Internal server error' });
        }
      } else {
        return res.status(500).json({ success: false, msg: 'Internal server error' });
      }
      
      const userTokenObj = {_id: account._id};
      const token = generateAccessToken(userTokenObj);

      const userCopy = JSON.parse(JSON.stringify(account));
      const customerCopy = JSON.parse(JSON.stringify(parent)); 
      delete userCopy.password;

      res.status(200).json({success:true, token: token, account: {...userCopy, ...customerCopy}});

    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false, msg:err.message });
    }
  },

  loginController : async (req, res) =>{
    try{
      const {email, password} = req.body;
      const account = await db.Account.findOne({email: email}).select('+password');
      if(!account) return res.status(403).json({success:false, msg:"Invalid Email"});
      const passwordVerified = await account.comparePassword(password);
      if(!passwordVerified) return res.status(403).json({success:false, msg:"Invalid Password"});

      const userTokenObj = {_id: account._id};
      const token = generateAccessToken(userTokenObj);

      const userCopy = JSON.parse(JSON.stringify(account));
      delete userCopy.password;
      var parentInfo = null;
      if (account.role === 'parent') {
        const parent = await db.Parent.findById(account.roleData['parent']);
        parentInfo = JSON.parse(JSON.stringify(parent)); 
      }
      res.status(200).json({success:true, token: token, account: {...userCopy, ...parentInfo}});

    } catch(err) {
      res.status(500).json({ success: false, msg:err.message })
    } 
  },
}

const generateAccessToken = (account) => {
  return jwt.sign(account, process.env.ACCESS_TOKEN_SECRET)
}
