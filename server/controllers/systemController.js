const SystemSetting = require('../models/SystemSetting');

const getSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find({});
    const settingsObj = {};
    settings.forEach(s => {
      settingsObj[s.key] = s.value;
    });
    res.json(settingsObj);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configurações do sistema.' });
  }
};

const updateSetting = async (req, res) => {
  const { key, value } = req.body;
  try {
    let setting = await SystemSetting.findOne({ key });
    if (setting) {
      setting.value = value;
      setting.updatedAt = Date.now();
      await setting.save();
    } else {
      setting = await SystemSetting.create({ key, value });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar configuração.' });
  }
};

module.exports = { getSettings, updateSetting };
