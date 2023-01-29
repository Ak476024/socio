const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Create Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'users' }]
});


module.exports = User  = mongoose.model('users', UserSchema);

