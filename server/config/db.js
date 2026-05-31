const mongoose = require('mongoose');

async function connectDB() {
  if (!process.env.MONGO_URI) {
    console.warn('MONGO_URI is missing. Add it to server/.env before using database routes.');
    return;
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
}

module.exports = connectDB;
