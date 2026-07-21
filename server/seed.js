require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for Seeding');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'cashvibe@credita.com' });
    if (existingUser) {
      console.log('⚠️ User cashvibe@credita.com already exists, skipping...');
    } else {
      // Create or get company for cashvibe
      let cashvibeCompany = await Company.findOne({ name: 'Cashvibe' });
      if (!cashvibeCompany) {
        cashvibeCompany = new Company({
          name: 'Cashvibe',
          nif: '987654321',
          subscriptionPlan: 'premium'
        });
        await cashvibeCompany.save();
        console.log('🏢 Cashvibe Company created');
      }

      // Create cashvibe user
      const cashvibeUser = new User({
        email: 'cashvibe@credita.com',
        password: '@Cashvibe123@',
        role: 'empresa',
        company: cashvibeCompany._id
      });
      await cashvibeUser.save();
      console.log('🧑‍� Cashvibe User created: cashvibe@credita.com');
    }

    console.log('🎉 Seeding Completo!');
    process.exit();
  } catch (err) {
    console.error('❌ Erro no seeding:', err);
    process.exit(1);
  }
};

seedDB();
