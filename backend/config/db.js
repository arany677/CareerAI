const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt MongoDB connection with 2-second timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/careerai', {
      serverSelectionTimeoutMS: 2000
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB is offline: ${error.message}`);
    console.warn('CareerAI Server running with local JSON database fallback (db_store.json).');
  }
};

module.exports = connectDB;
