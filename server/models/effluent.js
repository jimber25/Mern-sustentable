const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const effluent = require("./effluent");

const Effluentchema = mongoose.Schema({
  date: Date,
  creator_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  state: String,
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  reviews:[{
    date:Date,
    reviewer_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comments:String,
    state:String,
  }],
  Total_domestic_effluents:Number,
  Total_industrial_effluents:Number,
  Sludge_Mud_sent_for_disposal_landfill:Number,
  Total_effluents_per_unit_produced:Number,
  Percentage_Domestic_effluents:Number,
  Percentage_Industrial_effluents:Number,
  active:Boolean
});

SiteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Site", SiteSchema);
