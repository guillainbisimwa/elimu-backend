const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  pseudo : {type: String, required: 'Pseuo name required'},
  name : {type: String, required: 'Name required'},
  phones : {type: [String], required: 'Phone required'},
  address : {type: String, required: 'Address required'},
  imgUrl : {type: String },
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('parent', parentSchema);
