"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigurationSchema = new Schema(
  {
    flat_rate: { 
      type: Number,
      min: 0, 
      max: 100
    },
    flush_period: {
      type: Number,
      min: 0, 
      max: 24
    },
    max_finder_result: {
      type: Number,
      min: 1,
      max: 100,
      default: 10 
    }
  },
  { strict: true }
);

module.exports = mongoose.model("Configuration", ConfigurationSchema);
