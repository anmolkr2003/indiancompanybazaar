const Business = require('../models/Business');
exports.pending = async (req, res) => {
  const pending = await Business.find({ verified: false }).populate('seller', 'name email');
  res.json(pending);
};
exports.verify = async (req, res) => {
  const b = await Business.findById(req.params.id);
  if(!b) return res.status(404).json({ message: 'Not found' });
  b.verified = true;
  await b.save();
  res.json({ message: 'Verified', business: b });
};
exports.reject = async (req, res) => {
  const b = await Business.findById(req.params.id);
  if(!b) return res.status(404).json({ message: 'Not found' });
  await b.remove();
  res.json({ message: 'Rejected and removed' });
};
