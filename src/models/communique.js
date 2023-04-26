const mongoose = require('mongoose');

const communiqueSchema = new mongoose.Schema({
  motif: { type: String },
  anneeScolaire: { type: mongoose.Schema.Types.ObjectId, ref: 'AnneeScolaire', required: 'Annee Scolaire id is required' },
  eleve: { type: mongoose.Schema.Types.ObjectId, ref: 'Eleve', required: 'Eleve id is required' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: 'Parent id is required' },
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('communique', communiqueSchema);
