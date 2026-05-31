const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendAdminSignupEmail } = require('../services/emailService');

exports.signup = async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already exists' });
  const user = await User.create({ fullName, email, phone, password });
  sendAdminSignupEmail(user).catch(console.error);
  res.status(201).json({ token: generateToken(user._id), user: { _id: user._id, fullName, email, phone, role: user.role } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid email or password' });
  res.json({ token: generateToken(user._id), user: { _id: user._id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role } });
};

exports.me = async (req, res) => res.json({ user: req.user });
