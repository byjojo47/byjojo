const router = require('express').Router();
const controller = require('../controllers/orderController');
const { protect, optionalProtect, admin } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, controller.createOrder);
router.get('/my-orders', protect, controller.myOrders);
router.get('/confirmation/:id', controller.getConfirmationOrder);
router.get('/', protect, admin, controller.getOrders);
router.get('/:id', protect, admin, controller.getOrder);
router.put('/:id/status', protect, admin, controller.updateStatus);
router.put('/:id/payment-status', protect, admin, controller.updatePaymentStatus);

module.exports = router;