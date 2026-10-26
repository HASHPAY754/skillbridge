const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Skill must have an owner'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a skill title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: {
        values: [
          'Programming & Tech',
          'Design & Creative',
          'Academics & Science',
          'Languages',
          'Music & Audio',
          'Business & Career',
          'Other',
        ],
        message: '{VALUE} is not a valid category',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description of what you can teach'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    proficiencyLevel: {
      type: String,
      required: [true, 'Please specify your proficiency level'],
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        message: '{VALUE} is not a valid proficiency level',
      },
      index: true,
    },
    availability: {
      type: String,
      required: [true, 'Please select your general availability'],
      enum: {
        values: ['Weekdays', 'Weekends', 'Flexible', 'Evenings'],
        message: '{VALUE} is not a valid availability option',
      },
    },
    preferredExchange: {
      type: String,
      trim: true,
      maxlength: [200, 'Preferred exchange text cannot exceed 200 characters'],
      default: 'Open to any constructive peer skill exchange',
    },
  },
  {
    timestamps: true,
  }
);

// Compound text index for searching title and description
skillSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
