const mongoose = require("mongoose");

const SiteSchema = mongoose.Schema({
  name: String,
  cuit: String,
  address: String,
  phone: String,
  email: String,
  active: Boolean,
});

module.exports = mongoose.model("Site", SiteSchema);
