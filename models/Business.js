const mongoose = require('mongoose');
const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String,
  askingPrice: Number,
  revenue: Number,
  profit: Number,
  documents: [String],
  location: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Business', businessSchema);
