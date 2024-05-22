const mongoose = require("mongoose");

const CompanySchema = mongoose.Schema({
  name: String,
  phone: String,
  email: String,
  active: Boolean,
});

module.exports = mongoose.model("Company", CompanySchema);
