const express = require('express');
const router = express.Router();
const {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  getUserSkills,
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.get('/', getAllSkills);
router.get('/:id', getSkillById);
router.get('/user/:userId', getUserSkills);

router.post('/', protect, createSkill);
router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
