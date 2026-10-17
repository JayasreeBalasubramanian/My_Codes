const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  patientName: { type: String },
  bloodGroup: { type: String, required: true },
  unitsNeeded: { type: Number, required: true },
  urgency: { type: String, required: true },
  ward: { type: String, required: true },
  location: { type: String },
  responses: [
    {
      donorName: String,
      phone: String,
      bloodGroup: String,
      status: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Patient', patientSchema);
