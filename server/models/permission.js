const mongoose = require("mongoose");

const PermissionSchema = Schema({
  permission_code:{
      type: Number,
      unique: true
  },
  role: {
      type: Schema.Types.ObjectId,
      ref: 'Role'
  },
  description: String,
  module: String,
  action: String,
  active: Boolean
});

module.exports = mongoose.model("Permission", PermissionSchema);
