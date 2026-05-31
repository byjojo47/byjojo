const router = require('express').Router();
const controller = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', controller.getProducts);
router.get('/:slug', controller.getProduct);
router.post('/', protect, admin, controller.createProduct);
router.put('/:id', protect, admin, controller.updateProduct);
router.delete('/:id', protect, admin, controller.deleteProduct);

module.exports = router;
