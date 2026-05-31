require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Settings = require('../models/Settings');
const slugify = require('../utils/slugify');

const products = [
  {
    name: 'Blooming Eve',
    category: 'printed-linen',
    description: 'A graceful printed linen piece with soft floral energy, made for elegant table setups.',
    imageCount: 3,
    folder: 'blooming-eve',
  },
  {
    name: 'Safari Bloom',
    category: 'printed-linen',
    description: 'A warm botanical print inspired by natural textures and relaxed hosting.',
    imageCount: 6,
    folder: 'safari-bloom',
  },
  {
    name: 'Golden Garden',
    category: 'printed-linen',
    description: 'A premium garden-inspired linen with golden warmth and timeless table presence.',
    imageCount: 7,
    folder: 'golden-garden',
  },
  {
    name: 'Rose Élan',
    category: 'embroidery',
    description: 'An elegant embroidered linen piece with a refined rose mood and soft table presence.',
    imageCount: 7,
    folder: 'rose-elan',
  },
  {
    name: 'Olive Serenity',
    category: 'embroidery',
    description: 'A calm olive-toned embroidery design made for natural, graceful table settings.',
    imageCount: 5,
    folder: 'olive-serenity',
  },
  {
    name: 'Linen Whisper',
    category: 'embroidery',
    description: 'A quiet premium embroidery piece with delicate texture and timeless linen warmth.',
    imageCount: 6,
    folder: 'linen-whisper',
  },
  {
    name: 'Lemon Bloom',
    category: 'embroidery',
    description: 'A fresh embroidered linen design with a bright lemon bloom feeling for sunny tables.',
    imageCount: 7,
    folder: 'lemon-bloom',
  },
];

async function seed() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required');
  await mongoose.connect(process.env.MONGO_URI);

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');

  let admin = await User.findOne({ email: adminEmail });
  if (admin) {
    admin.fullName = process.env.ADMIN_FULL_NAME || 'ByJojo Admin';
    admin.password = adminPassword;
    admin.role = 'admin';
    await admin.save();
  } else {
    await User.create({ fullName: process.env.ADMIN_FULL_NAME || 'ByJojo Admin', email: adminEmail, phone: '', password: adminPassword, role: 'admin' });
  }

  const printedLinen = await Category.findOneAndUpdate(
    { slug: 'printed-linen' },
    { name: 'Printed Linen', slug: 'printed-linen', image: '/images/categories/printed-linen.webp', isActive: true, showOnHome: true },
    { upsert: true, returnDocument: 'after' },
  );
  const embroidery = await Category.findOneAndUpdate(
    { slug: 'embroidery' },
    { name: 'Embroidery', slug: 'embroidery', image: '/images/categories/embroidery.webp', isActive: true, showOnHome: true },
    { upsert: true, returnDocument: 'after' },
  );
  const categoryMap = {
    'printed-linen': printedLinen._id,
    embroidery: embroidery._id,
  };

  for (const item of products) {
    await Product.findOneAndUpdate(
      { slug: slugify(item.name) },
      {
        name: item.name,
        slug: slugify(item.name),
        description: item.description,
        price: 4500,
        category: categoryMap[item.category],
        stock: 10,
        isActive: true,
        featured: true,
        images: Array.from({ length: item.imageCount }, (_, index) => ({
          url: `/images/products/${item.folder}/${index + 1}.webp`,
          publicId: '',
          isMain: index === 0,
        })),
      },
      { upsert: true, returnDocument: 'after' },
    );
  }

  await Settings.findOneAndUpdate(
    {},
    {
      storeName: 'ByJojo',
      whatsappNumber: '+20 10 97796773',
      instagramUrl: 'https://www.instagram.com/byjojoeg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
      deliveryFee: 50,
      payment: { cashEnabled: true, instapayEnabled: true, instapayNumber: '', instapayQr: { url: '', publicId: '' } },
      announcementText: 'Limited pieces now available',
    },
    { upsert: true, returnDocument: 'after' },
  );

  console.log('Seed completed');
  await mongoose.disconnect();
}

if (require.main === module) {
  seed().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = seed;
