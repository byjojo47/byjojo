const Settings = require('../models/Settings');

async function getOrCreateSettings() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}

exports.getSettings = async (req, res) => res.json({ settings: await getOrCreateSettings() });

exports.updateSettings = async (req, res) => {
  const current = await getOrCreateSettings();
  const settings = await Settings.findByIdAndUpdate(current._id, req.body, { new: true });
  res.json({ settings });
};

exports.getOrCreateSettings = getOrCreateSettings;
