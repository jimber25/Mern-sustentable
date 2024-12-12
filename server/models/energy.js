const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const energy = require("./energy");

const EnergySchema = mongoose.Schema({
  date: Date,
  creator_user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  period:String,
  year:String,
  state: String,
  company:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  site:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site'
  },
  electricity:{
    electricity_standard:{
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
    electricity_cost:{
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
    renewable_energies:{
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
    renewable_energies_produced_and_consumed_on_site:{
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
  },
  fuels:{
    steam:{
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
    steam_cost:{
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
    natural_gas:{
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
    natural_gas_cost:{
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
    glp:{
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
    glp_cost:{
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
      isApproved:Boolean
    },
    heavy_fuel_oil:{
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
    cost_of_heavy_fuel_oil:{
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
    light_fuel_oil:{
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
    cost_of_light_fuel_oil:{
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
    coal:{
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
    coal_cost:{
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
    diesel:{
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
    diesel_cost:{
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
    gasoline_for_internal_vehicles:{
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
    gasoline_cost_of_internal_vehicles:{
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
    biomass:{
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
    biomass_cost:{
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

  },
  active:Boolean
});

EnergySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Energy", EnergySchema);
