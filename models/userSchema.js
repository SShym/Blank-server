const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  id: { type: String },
  googleId: {type: String},
  avatar: { type: String },
  avatarId: { type: String },
  name: { type: String, required:  true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  verified: {type: Boolean, default: false},
});

module.exports = mongoose.model("profile", userSchema);