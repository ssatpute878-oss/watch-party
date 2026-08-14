const mongoose = require('mongoose');

const watchPartySchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: [true, 'Room ID is required'],
    unique: true,
    index: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Watch Party Name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
    trim: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WatchParty', watchPartySchema);
