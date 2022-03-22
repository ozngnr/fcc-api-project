const mongoose = require('mongoose');

const { Schema } = mongoose;

const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

module.exports = mongoose.model('Url', urlSchema);
