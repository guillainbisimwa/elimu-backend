const mongoose = require('mongoose');

const classeSchema = new mongoose.Schema({
  name : {type: String, required: 'Name required'},
  anneeScolaire: { type: mongoose.Schema.Types.ObjectId, ref: 'AnneeScolaire', required: 'Annee Scolaire id is required' },
  ecole: { type: mongoose.Schema.Types.ObjectId, ref: 'Ecole', required: 'Ecole id is required' },
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('classe', classeSchema);
