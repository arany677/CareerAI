const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumeFile: {
    type: String,
    required: true
  },
  resumeScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  analysisResult: {
    score: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    atsCompatibility: String,
    rawText: String // Store parsed PDF text for potential re-analysis or skill-gap extraction
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', ResumeSchema);
