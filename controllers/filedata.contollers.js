const File = require('../models/fileData');

const uploadFile = (req, res, next) => {
  const file = req.file;

  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
};

module.exports = {
  uploadFile,
};
