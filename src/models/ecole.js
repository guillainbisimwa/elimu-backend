const mongoose = require('mongoose');

const ecoleSchema = new mongoose.Schema({
  name : {type: String, required: 'Name required'},
  phones : {type: [String], required: 'Phone required'},
  imgUrl : {type: String },
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('ecole', ecoleSchema);
