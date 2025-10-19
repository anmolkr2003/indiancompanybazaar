const Offer = require('../models/Offer');
const Business = require('../models/Business');
exports.create = async (req, res) => {
  const { businessId, amount, message } = req.body;
  const b = await Business.findById(businessId);
  if(!b || !b.verified) return res.status(400).json({ message: 'Business not available' });
  const offer = await Offer.create({ business: businessId, buyer: req.user._id, amount, message });
  res.status(201).json(offer);
};
exports.forBusiness = async (req, res) => {
  const offers = await Offer.find({ business: req.params.id }).populate('buyer', 'name email');
  res.json(offers);
};
exports.respond = async (req, res) => {
  const offer = await Offer.findById(req.params.id).populate('business');
  if(!offer) return res.status(404).json({ message: 'Offer not found' });
  if(offer.business.seller.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your business' });
  const { action } = req.body;
  if(action === 'accept') offer.status = 'accepted';
  if(action === 'reject') offer.status = 'rejected';
  await offer.save();
  res.json(offer);
};
