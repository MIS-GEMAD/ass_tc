"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CubeSchema = new Schema(
  {
    money_in_period: {
      
    },
    explorers_in_period: {
      
    }
  },
  { strict: false }
);

module.exports = mongoose.model("Cube", CubeSchema);
