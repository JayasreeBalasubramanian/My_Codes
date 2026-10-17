const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  urgency: { type: String, required: true }, // e.g. Immediate, Critical
  ward: { type: String, required: true },    // e.g. ICU, Ward 3B
  dateAdded: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);
