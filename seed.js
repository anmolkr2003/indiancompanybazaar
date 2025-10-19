const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./models/User');
const Business = require('./models/Business');

async function seed(){
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Business.deleteMany({});

  const admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'password123', role: 'admin' });
  const seller = new User({ name: 'Seller', email: 'seller@example.com', password: 'password123', role: 'seller', kycStatus: 'approved' });
  const buyer = new User({ name: 'Buyer', email: 'buyer@example.com', password: 'password123', role: 'buyer', kycStatus: 'approved' });
  const ca = new User({ name: 'CA', email: 'ca@example.com', password: 'password123', role: 'ca', kycStatus: 'approved' });

  await admin.save(); await seller.save(); await buyer.save(); await ca.save();

  const b = new Business({ name: 'Corner Cafe', description: 'A cozy cafe', category: 'Food', askingPrice: 250000, revenue: 120000, profit: 30000, seller: seller._id, verified: true });
  await b.save();
  console.log('Seed done'); process.exit(0);
}

seed().catch(e=>{ console.error(e); process.exit(1); });
