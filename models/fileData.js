const mongoose = require('mongoose');

const { Schema } = mongoose;

const fileDataSchema = new Schema({
  file: Buffer,
});

module.exports = mongoose.model('File', fileDataSchema);
