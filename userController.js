const User = require('../models/User');
const Skill = require('../models/Skill');

// @desc    Get user public profile and their listed skills
// @route   GET /api/users/:id
// @access  Public
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name college bio interests learningGoals avatar createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found.',
      });
    }

    const skills = await Skill.find({ owner: user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      user,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Protected
const updateMe = async (req, res, next) => {
  try {
    const { name, college, bio, interests, learningGoals, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (name) user.name = name.trim();
    if (college !== undefined) user.college = college.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests
        : interests
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    if (learningGoals !== undefined) {
      user.learningGoals = Array.isArray(learningGoals)
        ? learningGoals
        : learningGoals
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        bio: user.bio,
        interests: user.interests,
        learningGoals: user.learningGoals,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateMe,
};
