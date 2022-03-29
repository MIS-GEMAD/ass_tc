"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PictureSchema = new Schema(
  {
    picture: {
      data: Buffer, contentType: String,
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip'
    }
  },
  { strict: true }
);

module.exports = mongoose.model("Picture", PictureSchema);
