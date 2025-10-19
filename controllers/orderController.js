const Order = require('../models/Order');
const Business = require('../models/Business');
exports.create = async (req, res) => {
  const { businessId, amount } = req.body;
  const b = await Business.findById(businessId);
  if(!b || !b.verified) return res.status(400).json({ message: 'Business not available' });
  const order = await Order.create({ business: businessId, buyer: req.user._id, seller: b.seller, amount });
  res.status(201).json(order);
};
exports.markPaid = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({ message: 'Not found' });
  if(order.buyer.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not your order' });
  order.status = 'paid';
  await order.save();
  res.json(order);
};
exports.verifyByCA = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({ message: 'Not found' });
  order.status = 'verified_by_ca';
  await order.save();
  res.json(order);
};
exports.complete = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if(!order) return res.status(404).json({ message: 'Not found' });
  order.status = 'completed';
  await order.save();
  res.json(order);
};
