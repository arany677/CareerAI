const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');

    // timeout বাড়িয়ে ৫ সেকেন্ড করা হয়েছে এবং fallback লজিক মুছে দেওয়া হয়েছে
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // অনলাইনে JSON fallback কাজ করবে না, তাই এরর থ্রো করা হচ্ছে যাতে আমরা কারণ বুঝতে পারি
    throw new Error('Database connection failed. Please check MONGODB_URI and Network Access in Atlas.');
  }
};

module.exports = connectDB;