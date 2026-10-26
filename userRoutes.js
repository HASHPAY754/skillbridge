const express = require('express');
const router = express.Router();
const { getUserProfile, updateMe } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/:id', getUserProfile);
router.put('/me', protect, updateMe);

module.exports = router;
