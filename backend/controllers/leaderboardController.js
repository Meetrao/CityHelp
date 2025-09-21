const User = require('../models/User');
const Issue = require('../models/Issue');

// Get leaderboard with top users by points
exports.getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const users = await User.find({ isActive: true })
      .select('name email points avatar')
      .sort({ points: -1 })
      .limit(parseInt(limit));
    
    // Get additional stats for each user
    const leaderboard = await Promise.all(
      users.map(async (user) => {
        const issuesCount = await Issue.countDocuments({ reportedBy: user._id });
        const resolvedIssues = await Issue.countDocuments({ 
          reportedBy: user._id, 
          status: 'Resolved' 
        });
        
        return {
          ...user.toObject(),
          issuesReported: issuesCount,
          issuesResolved: resolvedIssues
        };
      })
    );
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

// Get user stats
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const [
      totalIssues,
      pendingIssues,
      resolvedIssues,
      user
    ] = await Promise.all([
      Issue.countDocuments({ reportedBy: userId }),
      Issue.countDocuments({ reportedBy: userId, status: 'Pending' }),
      Issue.countDocuments({ reportedBy: userId, status: 'Resolved' }),
      User.findById(userId).select('name email points avatar')
    ]);
    
    // Calculate rank
    const usersWithMorePoints = await User.countDocuments({
      points: { $gt: user.points },
      isActive: true
    });
    const rank = usersWithMorePoints + 1;
    
    res.json({
      user: {
        name: user.name,
        email: user.email,
        points: user.points,
        avatar: user.avatar,
        rank
      },
      stats: {
        totalIssues,
        pendingIssues,
        resolvedIssues,
        resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Error fetching user stats', error: error.message });
  }
};
