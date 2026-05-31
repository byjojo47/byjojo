const Product = require('../models/Product');
const slugify = require('../utils/slugify');
const {
  attachActiveOffersToProducts,
  attachActiveOfferToProduct,
} = require('../utils/offerPricing');
const { deleteAsset } = require('../services/cloudinaryService');

function safePublicIds(images = []) {
  return images
    .map((image) => image.publicId)
    .filter((publicId) => publicId && String(publicId).startsWith('byjojo/'));
}

async function deleteProductCloudinaryImages(product) {
  const publicIds = safePublicIds(product?.images || []);

  await Promise.allSettled(publicIds.map((publicId) => deleteAsset(publicId)));
}

exports.getProducts = async (req, res) => {
  const filter = req.query.admin ? {} : { isActive: true };

  if (req.query.featured === 'true') {
    filter.featured = true;
  }

  const products = await Product.find(filter)
    .populate('category')
    .sort('-createdAt');

  const productsWithOffers = await attachActiveOffersToProducts(products);

  res.json({ products: productsWithOffers });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate('category');

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const productWithOffer = await attachActiveOfferToProduct(product);

  res.json({ product: productWithOffer });
};

exports.createProduct = async (req, res) => {
  const product = await Product.create({
    ...req.body,
    slug: slugify(req.body.name),
    images: req.body.images || [],
  });

  const productWithCategory = await Product.findById(product._id).populate('category');
  const productWithOffer = await attachActiveOfferToProduct(productWithCategory);

  res.status(201).json({ product: productWithOffer });
};

exports.updateProduct = async (req, res) => {
  const update = { ...req.body };

  if (update.name) {
    update.slug = slugify(update.name);
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true },
  ).populate('category');

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const productWithOffer = await attachActiveOfferToProduct(product);

  res.json({ product: productWithOffer });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await deleteProductCloudinaryImages(product);

  res.json({ message: 'Product deleted' });
};