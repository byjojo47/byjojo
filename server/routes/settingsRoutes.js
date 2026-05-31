const router = require('express').Router();
const controller = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', controller.getSettings);
router.put('/', protect, admin, controller.updateSettings);

module.exports = router;
