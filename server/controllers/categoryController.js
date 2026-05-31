const Category = require('../models/Category');
const slugify = require('../utils/slugify');

exports.getCategories = async (req, res) => {
  const filter = req.query.admin ? {} : { isActive: true };
  const categories = await Category.find(filter).sort('name');
  res.json({ categories });
};

exports.createCategory = async (req, res) => {
  const slug = slugify(req.body.name);
  const category = await Category.create({
    ...req.body,
    slug,
    image: req.body.image || `/images/categories/${slug}.webp`,
  });
  res.status(201).json({ category });
};

exports.updateCategory = async (req, res) => {
  const update = { ...req.body };
  if (update.name) {
    update.slug = slugify(update.name);
    if (!update.image) update.image = `/images/categories/${update.slug}.webp`;
  }
  const category = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
  res.json({ category });
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted' });
};
