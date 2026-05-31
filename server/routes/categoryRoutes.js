const router = require('express').Router();
const controller = require('../controllers/categoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', controller.getCategories);
router.post('/', protect, admin, controller.createCategory);
router.put('/:id', protect, admin, controller.updateCategory);
router.delete('/:id', protect, admin, controller.deleteCategory);

module.exports = router;
