const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true }
});

module.exports = mongoose.model('Donor', donorSchema);