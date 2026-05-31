const router = require('express').Router();
const controller = require('../controllers/discountCodeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/validate', controller.validateCode);
router.get('/', protect, admin, controller.getCodes);
router.post('/', protect, admin, controller.createCode);
router.put('/:id', protect, admin, controller.updateCode);
router.delete('/:id', protect, admin, controller.deleteCode);
router.post('/:id/email-customers', protect, admin, controller.emailCode);

module.exports = router;
