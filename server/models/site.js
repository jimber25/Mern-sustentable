const mongoose = require("mongoose");

const SiteSchema = mongoose.Schema({
  name: String,
  cuit: String,
  address: String,
  phone: String,
  email: String,
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  active: Boolean,
});

module.exports = mongoose.model("Site", SiteSchema);
