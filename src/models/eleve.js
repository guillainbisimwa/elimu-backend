const mongoose = require('mongoose');

const eleveSchema = new mongoose.Schema({
  name : {type: String, required: 'Name required'},
  phones : {type: [String], required: 'Phone required'},
  address : {type: String, required: 'Address required'},
  imgUrl : {type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: 'Parent id is required' },
  classe: { type: mongoose.Schema.Types.ObjectId, ref: 'Classe', required: 'Classe id is required' },
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('eleve', eleveSchema);
