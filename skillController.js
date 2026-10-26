const Skill = require('../models/Skill');
const ExchangeRequest = require('../models/ExchangeRequest');

// @desc    Get all skills with search, category/level filters, and pagination
// @route   GET /api/skills
// @access  Public
const getAllSkills = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const { search, category, level, sort } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by proficiency level
    if (level && level !== 'All') {
      query.proficiencyLevel = level;
    }

    // Search query across title and description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { preferredExchange: searchRegex },
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .populate('owner', 'name college avatar bio')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: skills.length,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: page,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single skill by ID
// @route   GET /api/skills/:id
// @access  Public
const getSkillById = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id).populate(
      'owner',
      'name email college avatar bio interests learningGoals createdAt'
    );

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill offer not found.',
      });
    }

    return res.status(200).json({
      success: true,
      skill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Protected
const createSkill = async (req, res, next) => {
  try {
    const { title, category, description, proficiencyLevel, availability, preferredExchange } = req.body;

    if (!title || !category || !description || !proficiencyLevel || !availability) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: title, category, description, proficiency level, and availability.',
      });
    }

    const skill = await Skill.create({
      owner: req.user._id,
      title: title.trim(),
      category,
      description: description.trim(),
      proficiencyLevel,
      availability,
      preferredExchange: preferredExchange ? preferredExchange.trim() : 'Any relevant skill exchange',
    });

    const populatedSkill = await Skill.findById(skill._id).populate('owner', 'name college avatar');

    return res.status(201).json({
      success: true,
      message: 'Skill offered successfully!',
      skill: populatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Protected (Owner only)
const updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    // Verify ownership
    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to update this skill.',
      });
    }

    const { title, category, description, proficiencyLevel, availability, preferredExchange } = req.body;

    if (title) skill.title = title.trim();
    if (category) skill.category = category;
    if (description) skill.description = description.trim();
    if (proficiencyLevel) skill.proficiencyLevel = proficiencyLevel;
    if (availability) skill.availability = availability;
    if (preferredExchange !== undefined) skill.preferredExchange = preferredExchange.trim();

    await skill.save();

    const updatedSkill = await Skill.findById(skill._id).populate('owner', 'name college avatar');

    return res.status(200).json({
      success: true,
      message: 'Skill updated successfully!',
      skill: updatedSkill,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Protected (Owner only)
const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found.',
      });
    }

    // Verify ownership
    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You are not authorized to delete this skill.',
      });
    }

    // Clean up related pending exchange requests
    await ExchangeRequest.deleteMany({ skill: skill._id });

    await Skill.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Skill deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skills offered by a specific user
// @route   GET /api/skills/user/:userId
// @access  Public
const getUserSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find({ owner: req.params.userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getUserSkills,
};
