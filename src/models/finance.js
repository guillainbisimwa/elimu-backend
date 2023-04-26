const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  montant : {type: Number, required: 'Montant required'},
  anneeScolaire: { type: mongoose.Schema.Types.ObjectId, ref: 'AnneeScolaire', required: 'Annee Scolaire id is required' },
  eleve: { type: mongoose.Schema.Types.ObjectId, ref: 'Eleve', required: 'Eleve id is required' },
  datePayement: { type: Date},
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('finance', financeSchema);
