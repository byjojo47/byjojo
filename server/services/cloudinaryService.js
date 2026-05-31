const cloudinary = require('../config/cloudinary');

function uploadBuffer(buffer, folder = 'byjojo') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );

    stream.end(buffer);
  });
}

async function deleteAsset(publicId) {
  if (!publicId) return null;

  return cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
}

module.exports = {
  uploadBuffer,
  deleteAsset,
};