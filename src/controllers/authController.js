const jwt = require('jsonwebtoken');
const db  = require('../../../models');

module.exports = {
 
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
