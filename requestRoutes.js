const express = require('express');
const router = express.Router();
const {
  createRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateRequestStatus,
  cancelRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');

// All request routes require authentication
router.use(protect);

router.post('/', createRequest);
router.get('/incoming', getIncomingRequests);
router.get('/outgoing', getOutgoingRequests);
router.patch('/:id/status', updateRequestStatus);
router.patch('/:id/cancel', cancelRequest);

module.exports = router;
