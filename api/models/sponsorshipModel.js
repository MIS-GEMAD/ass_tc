"use strict";
const mongoose = require("mongoose");
require('mongoose-type-url');
const Schema = mongoose.Schema;

const SponsorshipSchema = new Schema(
  {
    banner: { 
      data: Buffer, contentType: String
    },
    link: {
      type: mongoose.SchemaTypes.Url,
    },
    is_paid: {
      type: Boolean,
      default: false
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip'
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'Actor'
    }
  },
  { strict: true }
);

module.exports = mongoose.model("Sponsorship", SponsorshipSchema);
