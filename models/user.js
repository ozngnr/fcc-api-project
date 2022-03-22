const mongoose = require('mongoose');

const { Schema } = mongoose;

const exerciseSchema = new Schema({
  description: { type: String, required: [true, 'Description is required!'] },
  duration: { type: Number, required: [true, 'Duration is required!'] },
  date: String,
});

const userSchema = new Schema({
  username: { type: String, required: [true, 'Username is required!'] },
  count: Number,
  log: [exerciseSchema],
});

const Exercise = mongoose.model('Exercise', exerciseSchema);
const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  Exercise,
};
