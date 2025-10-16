// 🌐 Core Imports
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// 🚀 App Initialization
const app = express();

// 🛡️ Middleware
app.use(cors({
  origin: 'https://your-vercel-frontend.vercel.app', // replace with actual Vercel URL
  credentials: true
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// 📦 Route Imports
const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const statsRoutes = require('./routes/statsRoutes');

// 🛣️ Route Mounting
app.use('/api', authRoutes);
app.use('/api', issueRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', statsRoutes);

// 🧠 MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// 🚀 Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
