const ExchangeRequest = require('../models/ExchangeRequest');
const Skill = require('../models/Skill');

// @desc    Create an exchange request for a skill
// @route   POST /api/requests
// @access  Protected
const createRequest = async (req, res, next) => {
  try {
    const { skillId, message, offeredSkill } = req.body;

    if (!skillId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both the skill ID and a personalized introductory message.',
      });
    }

    const skill = await Skill.findById(skillId);
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'The requested skill does not exist or has been removed.',
      });
    }

    // Prevent requesting own skill
    if (skill.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a skill exchange request for your own offered skill.',
      });
    }

    // Check for existing pending request
    const existingPending = await ExchangeRequest.findOne({
      requester: req.user._id,
      skill: skillId,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active pending exchange request for this skill.',
      });
    }

    const newRequest = await ExchangeRequest.create({
      requester: req.user._id,
      recipient: skill.owner,
      skill: skill._id,
      offeredSkill: offeredSkill ? offeredSkill.trim() : '',
      message: message.trim(),
      status: 'pending',
    });

    const populated = await ExchangeRequest.findById(newRequest._id)
      .populate('requester', 'name email college avatar')
      .populate('recipient', 'name email college avatar')
      .populate('skill', 'title category proficiencyLevel');

    return res.status(201).json({
      success: true,
      message: 'Exchange request submitted successfully!',
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get incoming exchange requests (as recipient/owner)
// @route   GET /api/requests/incoming
// @access  Protected
const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ recipient: req.user._id })
      .populate('requester', 'name email college avatar bio interests learningGoals')
      .populate('skill', 'title category proficiencyLevel availability')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get outgoing exchange requests (as requester)
// @route   GET /api/requests/outgoing
// @access  Protected
const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await ExchangeRequest.find({ requester: req.user._id })
      .populate('recipient', 'name email college avatar bio interests')
      .populate('skill', 'title category proficiencyLevel availability')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept or reject an incoming request
// @route   PATCH /api/requests/:id/status
// @access  Protected (Recipient only)
const updateRequestStatus = async (req, res, next) => {
  try {
    const { status, responseNote } = req.body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either "accepted" or "rejected".',
      });
    }

    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found.',
      });
    }

    // Only recipient can accept/reject
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the recipient can accept or reject this request.',
      });
    }

    // Only pending requests can be modified
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request cannot be modified because it is already ${request.status}.`,
      });
    }

    request.status = status;
    if (responseNote) {
      request.responseNote = responseNote.trim();
    }

    await request.save();

    const populated = await ExchangeRequest.findById(request._id)
      .populate('requester', 'name email college avatar')
      .populate('recipient', 'name email college avatar')
      .populate('skill', 'title category proficiencyLevel');

    return res.status(200).json({
      success: true,
      message: `Exchange request has been ${status}.`,
      request: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an outgoing exchange request
// @route   PATCH /api/requests/:id/cancel
// @access  Protected (Requester only)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found.',
      });
    }

    // Only requester can cancel
    if (request.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Only the requester can cancel this exchange request.',
      });
    }

    // Only pending requests can be cancelled
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that has already been ${request.status}.`,
      });
    }

    request.status = 'cancelled';
    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Exchange request cancelled successfully.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
  cancelRequest,
};
