const express = require('express');
const router = express.Router();
const { getPlatformStats } = require('../controllers/statsController');

router.get('/overview', getPlatformStats);

module.exports = router;
