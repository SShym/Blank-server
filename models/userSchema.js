const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: { type: String, required:  true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String },
  verified: {type: Boolean, default: false}
});

module.exports = mongoose.model("profile", userSchema);