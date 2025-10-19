const Business = require('../models/Business');
exports.create = async (req, res) => {
  const data = req.body;
  const docPaths = (req.files||[]).map(f => '/uploads/' + f.filename);
  const business = await Business.create({ ...data, documents: docPaths, seller: req.user._id, verified: false });
  res.status(201).json(business);
};
exports.listVerified = async (req, res) => {
  const list = await Business.find({ verified: true }).populate('seller', 'name email');
  res.json(list);
};
exports.listMine = async (req, res) => {
  const list = await Business.find({ seller: req.user._id });
  res.json(list);
};
exports.get = async (req, res) => {
  const b = await Business.findById(req.params.id).populate('seller', 'name email');
  if(!b) return res.status(404).json({ message: 'Not found' });
  if(!b.verified && b.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'ca') {
    return res.status(403).json({ message: 'Not visible' });
  }
  res.json(b);
};
