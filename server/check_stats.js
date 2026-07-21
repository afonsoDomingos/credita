const mongoose = require('mongoose');
require('dotenv').config();

async function main() {
  const mongoUri = process.env.MONGO_URI;
  console.log('Connecting to:', mongoUri);
  await mongoose.connect(mongoUri, { family: 4, serverSelectionTimeoutMS: 8000 });
  console.log('✅ CONNECTED SUCCESSFULLY TO MONGODB ATLAS!');
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Connection Failed:', err.message);
  process.exit(1);
});
