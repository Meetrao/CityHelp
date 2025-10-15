const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const authRoutes = require('./routes/authRoutes');
const issueRoutes = require('./routes/issueRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const statsRoutes = require('./routes/statsRoutes');

app.use('/api', authRoutes);
app.use('/api', issueRoutes);
app.use('/api', leaderboardRoutes);
app.use('/api', statsRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch((err) => console.error('MongoDB error:', err));

app.listen(5000, () => {
  console.log('🚀 Server running on http://localhost:5000');
});
