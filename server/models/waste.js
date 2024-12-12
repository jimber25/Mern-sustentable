const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const waste = require("./waste");

const WasteSchema = mongoose.Schema({
  date: Date,
  creator_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  period:String,
  year:String,
  state: String,
  // company:{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Company'
  // },
  site:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site'
  },
  paper_and_cardboard_sent_to_recycling_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  plastic_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  fabric_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  metal_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  wood_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  other_general_waste_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
 leathers_sent_to_recycle_or_reuse:{
  code:String,
  unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  rubber_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  food_scraps_sent_to_recycle_or_reuse:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  paper_and_cardboard_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  plastic_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  fabric_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  metal_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  wood_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  other_general_waste_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  other_general_waste_sent_to_other_types_of_disposal:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  total_sent_to_landfill:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  total_sent_for_reuse_or_recycling:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  total_sent_to_incineration:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  total_general_waste_sent_to_other_types_of_disposal:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  total_non_hazardous_waste_unit_produced:{
    code:String,
    unit: String,
    value:Number,
    reviews:[{
      date:Date,
      reviewer_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comments:String
    }],
    isApproved:Boolean,
    file:String
  },
  active:Boolean
});

WasteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Waste", WasteSchema);
