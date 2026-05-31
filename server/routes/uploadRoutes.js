const router = require('express').Router();
const controller = require('../controllers/uploadController');
const upload = require('../middleware/uploadMiddleware');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/image', protect, admin, upload.single('image'), controller.uploadImage);
router.delete('/image', protect, admin, controller.deleteImage);

module.exports = router;