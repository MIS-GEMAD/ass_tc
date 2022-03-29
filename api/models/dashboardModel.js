"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DashboardSchema = new Schema(
  {
    trip_stats_by_manager: {
      
    },
    application_by_trip : {

    },
    trip_price_stats: {
      
    },
    ratio_applications_by_status: {
      
    },
    average_in_finders: {

    },
    top_10_words_in_finders: {

    },
    computationMoment: {
      type: Date,
      default: Date.now
    },
    rebuildPeriod: {
      type: String
    }
  },
  { strict: false }
);

module.exports = mongoose.model("Dashboard", DashboardSchema);