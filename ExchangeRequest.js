const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester is required'],
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
      index: true,
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference is required'],
      index: true,
    },
    offeredSkill: {
      type: String,
      trim: true,
      maxlength: [120, 'Offered skill description cannot exceed 120 characters'],
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Please include a message for the skill owner'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
      index: true,
    },
    responseNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Response note cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent multiple pending requests for the exact same requester and skill
exchangeRequestSchema.index(
  { requester: 1, skill: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'pending' } }
);

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
