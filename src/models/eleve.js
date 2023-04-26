const mongoose = require('mongoose');

const ecoleSchema = new mongoose.Schema({
  name : {type: String, required: 'Name required'},
  phones : {type: [String], required: 'Phone required'},
  address : {type: String, required: 'Address required'},
  imgUrl : {type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: 'Parent id is required' },
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('ecole', ecoleSchema);
