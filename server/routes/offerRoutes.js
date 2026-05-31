const router = require('express').Router();
const controller = require('../controllers/offerController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', controller.getOffers);
router.post('/', protect, admin, controller.createOffer);
router.put('/:id', protect, admin, controller.updateOffer);
router.delete('/:id', protect, admin, controller.deleteOffer);
router.post('/:id/email-customers', protect, admin, controller.emailOffer);

module.exports = router;
