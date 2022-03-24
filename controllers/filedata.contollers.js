const File = require('../models/fileData');
const fs = require('fs');

const uploadFile = async (req, res, next) => {
  const file = req.file;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(err);
  }
  const data = fs.readFileSync(req.file.path);
  const newFile = await new File({ file: data });
  newFile.save();

  res.json({
    name: file.originalname,
    type: file.mimetype,
    size: file.size,
  });
};

module.exports = {
  uploadFile,
};
