require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Company = require('./models/Company');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected for Seeding');

    // Apagar dados antigos de Auth para evitar duplicação (opcional)
    await User.deleteMany();
    await Company.deleteMany();

    // 1. Criar utilizador Superadmin
    const superAdmin = new User({
      email: 'superadmin@credita.com',
      password: '@Admin123@',
      role: 'superadmin'
    });
    await superAdmin.save();
    console.log('👨‍💻 Superadmin criado: superadmin@credita.com');

    // 2. Criar Empresa de Teste
    const empresaTeste = new Company({
      name: 'Empresa Teste',
      nif: '123456789',
      subscriptionPlan: 'premium'
    });
    const savedCompany = await empresaTeste.save();
    console.log('🏢 Empresa Teste criada');

    // 3. Criar utilizador da Empresa
    const userEmpresa = new User({
      email: 'empresa@credita.com',
      password: '@Empresa123@',
      role: 'empresa',
      company: savedCompany._id
    });
    await userEmpresa.save();
    console.log('🧑‍💼 User da Empresa criado: empresa@credita.com');

    console.log('🎉 Seeding Completo!');
    process.exit();
  } catch (err) {
    console.error('❌ Erro no seeding:', err);
    process.exit(1);
  }
};

seedDB();
