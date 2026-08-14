const express = require('express');
const router = express.Router();
const { createParty, getPartyByRoomId, getUserParties, endParty } = require('../controllers/partyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createParty);
router.get('/user/my-parties', protect, getUserParties);
router.get('/:roomId', protect, getPartyByRoomId);
router.delete('/:roomId', protect, endParty);

module.exports = router;
