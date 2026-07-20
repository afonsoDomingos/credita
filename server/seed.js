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

    // 4. Adicionar 3 Clientes Reais à Empresa
    const Client = require('./models/Client');
    await Client.deleteMany();
    
    const clientesReais = [
      {
        company: savedCompany._id,
        name: 'Maria João Santos',
        phone: '+244 923 456 789',
        idCard: '001234567LA032',
        address: 'Talatona, Luanda'
      },
      {
        company: savedCompany._id,
        name: 'Carlos Alberto Costa',
        phone: '+244 945 678 123',
        idCard: '007654321LA045',
        address: 'Maianga, Luanda'
      },
      {
        company: savedCompany._id,
        name: 'Ana Paula Fernandes',
        phone: '+244 912 345 678',
        idCard: '009876543LA011',
        address: 'Viana, Luanda'
      }
    ];

    await Client.insertMany(clientesReais);
    console.log('👥 3 Clientes reais inseridos no banco de dados para a Empresa Teste!');

    console.log('🎉 Seeding Completo!');
    process.exit();
  } catch (err) {
    console.error('❌ Erro no seeding:', err);
    process.exit(1);
  }
};

seedDB();
