const mongoose = require('mongoose');
require('dotenv').config();

const Notification = require('./models/Notification');
const Receipt = require('./models/Receipt');

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/microcredito';
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri);

  const totalNotifs = await Notification.countDocuments({});
  const unreadNotifs = await Notification.countDocuments({ isRead: false });
  const pendingReceipts = await Receipt.countDocuments({ status: 'pending' });

  console.log('\n--- SYSTEM STATS ---');
  console.log('Total Notifications:', totalNotifs);
  console.log('Unread Notifications:', unreadNotifs);
  console.log('Pending Verification Receipts:', pendingReceipts);
  
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
