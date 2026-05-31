const router = require('express').Router();
const controller = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/overview', protect, admin, controller.overview);

module.exports = router;
