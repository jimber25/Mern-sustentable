const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  company: String,
  position: String,
  sector: String,
  role: String,
  active: Boolean,
  avatar: String,
});

module.exports = mongoose.model("User", UserSchema);
