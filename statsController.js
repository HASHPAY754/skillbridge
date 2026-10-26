const User = require('../models/User');
const Skill = require('../models/Skill');
const ExchangeRequest = require('../models/ExchangeRequest');

// @desc    Get global platform metrics & stats
// @route   GET /api/stats/overview
// @access  Public
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalSkills, totalExchanges, acceptedExchanges] = await Promise.all([
      User.countDocuments(),
      Skill.countDocuments(),
      ExchangeRequest.countDocuments(),
      ExchangeRequest.countDocuments({ status: 'accepted' }),
    ]);

    // Aggregate category distribution
    const categoryStats = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSkills,
        totalExchanges,
        acceptedExchanges,
        categoryStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlatformStats,
};
