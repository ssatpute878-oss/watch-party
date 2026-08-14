const crypto = require('crypto');
const WatchParty = require('../models/WatchParty');

// Helper to generate unique room ID
const generateRoomId = () => {
  const hex = crypto.randomBytes(4).toString('hex');
  return `room-${hex}`;
};

// @desc    Create a new Watch Party
// @route   POST /api/parties
// @access  Private
const createParty = async (req, res) => {
  try {
    const { name, description, videoUrl } = req.body;

    if (!name || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide party name and video URL'
      });
    }

    let roomId = generateRoomId();
    let isUnique = false;
    let attempts = 0;

    // Ensure uniqueness of roomId
    while (!isUnique && attempts < 5) {
      const existing = await WatchParty.findOne({ roomId });
      if (!existing) {
        isUnique = true;
      } else {
        roomId = generateRoomId();
        attempts++;
      }
    }

    const party = await WatchParty.create({
      roomId,
      name,
      description: description || '',
      videoUrl,
      host: req.user.id
    });

    const populatedParty = await WatchParty.findById(party._id).populate('host', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Watch Party created successfully',
      party: populatedParty
    });
  } catch (error) {
    console.error('Create Party Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating watch party'
    });
  }
};

// @desc    Get party details by Room ID
// @route   GET /api/parties/:roomId
// @access  Private
const getPartyByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;

    const party = await WatchParty.findOne({ roomId, isActive: true }).populate('host', 'name email');

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found or inactive'
      });
    }

    return res.json({
      success: true,
      party
    });
  } catch (error) {
    console.error('Get Party Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching watch party'
    });
  }
};

// @desc    Get user hosted parties
// @route   GET /api/parties/user/my-parties
// @access  Private
const getUserParties = async (req, res) => {
  try {
    const parties = await WatchParty.find({ host: req.user.id, isActive: true })
      .sort({ createdAt: -1 })
      .populate('host', 'name email');

    return res.json({
      success: true,
      parties
    });
  } catch (error) {
    console.error('Get User Parties Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user parties'
    });
  }
};

// @desc    End/Delete a watch party (Host only)
// @route   DELETE /api/parties/:roomId
// @access  Private
const endParty = async (req, res) => {
  try {
    const { roomId } = req.params;

    const party = await WatchParty.findOne({ roomId });

    if (!party) {
      return res.status(404).json({
        success: false,
        message: 'Watch party not found'
      });
    }

    if (party.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can end this watch party'
      });
    }

    party.isActive = false;
    await party.save();

    return res.json({
      success: true,
      message: 'Watch party ended successfully'
    });
  } catch (error) {
    console.error('End Party Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error ending watch party'
    });
  }
};

module.exports = {
  createParty,
  getPartyByRoomId,
  getUserParties,
  endParty
};
