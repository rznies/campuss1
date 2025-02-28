require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');
const User = require('../models/User');
const Post = require('../models/Post');
const Match = require('../models/Match');
const Chat = require('../models/Chat');
const Compliment = require('../models/Compliment');

const initializeDb = async () => {
  try {
    // Connect to database
    await connectDB();
    
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Match.deleteMany({}),
      Chat.deleteMany({}),
      Compliment.deleteMany({})
    ]);

    console.log('Creating admin user...');
    const adminUser = await User.create({
      email: 'admin@campus.edu',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: 'System Admin',
      isVerified: true,
      isAdmin: true
    });

    console.log('Creating test users...');
    const users = await User.insertMany([
      {
        email: 'john@campus.edu',
        password: 'password123',
        name: 'John Doe',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        course: 'Computer Science',
        interests: ['Programming', 'Basketball', 'Music'],
        points: 1250,
        badges: ['Early Adopter', 'Top Contributor'],
        isVerified: true
      },
      {
        email: 'jane@campus.edu',
        password: 'password123',
        name: 'Jane Smith',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
        course: 'Data Science',
        interests: ['Machine Learning', 'Photography', 'Hiking'],
        points: 980,
        badges: ['Helpful Hero'],
        isVerified: true
      },
      {
        email: 'mike@campus.edu',
        password: 'password123',
        name: 'Mike Wilson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
        course: 'Mechanical Engineering',
        interests: ['Robotics', 'Guitar', 'Movies'],
        points: 750,
        badges: ['Rising Star'],
        isVerified: true
      }
    ]);

    console.log('Creating matches...');
    await Match.insertMany([
      {
        users: [users[0]._id, users[1]._id],
        initiator: users[0]._id,
        status: 'accepted',
        compatibilityScore: 85,
        matchReason: 'Similar interests in technology and outdoor activities',
        commonInterests: ['Programming', 'Photography'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        users: [users[1]._id, users[2]._id],
        initiator: users[1]._id,
        status: 'pending',
        compatibilityScore: 75,
        matchReason: 'Both interested in arts and technology',
        commonInterests: ['Photography', 'Music'],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('Creating posts...');
    await Post.insertMany([
      {
        author: users[0]._id,
        content: 'Just finished my final project! 🎉 #coding #graduation',
        tags: ['coding', 'graduation'],
        visibility: 'public',
        likes: [users[1]._id, users[2]._id],
        comments: [{
          author: users[1]._id,
          content: 'Congratulations! 🎊',
        }]
      },
      {
        author: users[1]._id,
        content: 'Looking for study partners for the upcoming Data Structures exam! 📚',
        tags: ['study', 'computerscience'],
        visibility: 'course',
        course: 'Computer Science',
        likes: [users[0]._id],
        comments: [{
          author: users[0]._id,
          content: 'I\'m in! Library tomorrow?'
        }]
      }
    ]);

    console.log('Creating chats...');
    await Chat.insertMany([
      {
        participants: [users[0]._id, users[1]._id],
        messages: [{
          sender: users[0]._id,
          content: 'Hey! Want to study together?',
        }],
        lastMessage: 'Hey! Want to study together?',
        unreadCount: 1,
        lastActivity: new Date()
      }
    ]);

    console.log('Creating compliments...');
    await Compliment.insertMany([
      {
        recipient: users[0]._id,
        message: 'Thanks for helping with the project!',
      },
      {
        recipient: users[1]._id,
        message: 'Great presentation today!',
      }
    ]);

    console.log('Database initialized successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Handle script interruption
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

initializeDb();