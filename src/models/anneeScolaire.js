const mongoose = require('mongoose');

const anneeScolaireSchema = new mongoose.Schema({
  name : {type: String, required: 'Name required'},
  timestamp: { type: Date, default: Date.now()}
});

module.exports = mongoose.model('anneeScolaire', anneeScolaireSchema);
