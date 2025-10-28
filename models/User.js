const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  role: { type: String, enum: ["user","buyer", "seller", "ca", "admin"], default: "buyer" },
  isVerified: { type: Boolean, default: false },
  verificationToken: String
});
// userSchema.pre('save', async function(next){ if(!this.isModified('password')) return next(); const salt= await bcrypt.genSalt(10); this.password = await bcrypt.hash(this.password, salt); next(); });
userSchema.methods.comparePassword = function(candidate){ return bcrypt.compare(candidate, this.password); }
module.exports = mongoose.model('User', userSchema);
