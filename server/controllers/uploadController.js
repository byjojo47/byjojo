const { uploadBuffer, deleteAsset } = require('../services/cloudinaryService');

function isAllowedFolder(folder) {
  return String(folder || '').startsWith('byjojo');
}

function isAllowedPublicId(publicId) {
  return String(publicId || '').startsWith('byjojo/');
}

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please choose an image file' });
  }

  const folder = req.body.folder || 'byjojo';

  if (!isAllowedFolder(folder)) {
    return res.status(400).json({ message: 'Invalid upload folder' });
  }

  const result = await uploadBuffer(req.file.buffer, folder);

  res.status(201).json({
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
};

exports.deleteImage = async (req, res) => {
  const publicId = req.body.publicId;

  if (!publicId) {
    return res.status(400).json({ message: 'publicId is required' });
  }

  if (!isAllowedPublicId(publicId)) {
    return res.status(400).json({ message: 'Invalid image publicId' });
  }

  const result = await deleteAsset(publicId);

  res.json({
    message: 'Image deleted',
    result,
  });
};