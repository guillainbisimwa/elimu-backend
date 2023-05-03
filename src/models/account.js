const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const accountSchema = new mongoose.Schema({
  email : {type: String, unique: true, lowercase: true},
  socialMediaToken :{
    google: { type: String },
    facebook: { type: String },
    linkdin: { type: String },
  },
  guest: { type: Boolean },
  phoneNumber: { type: String, unique: true },
  otp: { 
    type: Number,
    default: Math.floor(Math.random() * 6),
  },
  lang: { type: String, enum: ['fr', 'en'],  default: 'fr'},
  password : {type: String, select: false},
  fingerPrintHash: { type: String },

  role : { required: true, type: String },
  roleData :   {
    parent : { type: mongoose.Schema.Types.ObjectId, rel:  'Parent' },
    eleve : { type: mongoose.Schema.Types.ObjectId, rel:  'Eleve' },
  },
  timestamp: { type: Date, default: Date.now()},
});

accountSchema.pre('save', function(next) {
  var account = this;
  if (!account.isModified('password')) {
    return next();
  }
  
  bcrypt.genSalt(10)
  .then(salt => bcrypt.hash(account.password, salt))
  .then(hash => {
    account.password = hash;
    next();
  })
  .catch(err =>{
    console.error(err);
  });
});

accountSchema.methods.comparePassword = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password)
    .then(isMatch => {resolve(isMatch)})
    .catch(err => {reject(err)});  
  })
};

module.exports = mongoose.model('account', accountSchema);
