const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const initializeDb = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    
    // Create admin user
    await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      isVerified: true
    });

    console.log('Database initialized successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDb();