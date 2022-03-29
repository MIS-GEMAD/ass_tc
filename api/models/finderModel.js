"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FinderSchema = new Schema(
  {
    moment: {
      type: Date,
      max: Date.now(),
      default: Date.now(),
      required: 'Kindly enter the moment'
    },
    keyword: {
      type: String
    },
    price_from: {
      type: Number
    },
    price_to: {
      type: Number
    },
    date_from : {
      type: Date
    },
    date_to : {
      type: Date
    },
    trips : [{
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    }],
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'Actor'
    }
  },
  { strict: false }
);

FinderSchema.pre('save', function(callback) {
  const Trip = mongoose.model("Trip");
  const Configuration = mongoose.model("Configuration");

  const finder = this

  Configuration.find({}, function (err, configurations) {
    if (configurations) {
      const max_result = configurations[0].max_finder_result

      const regex = new RegExp(finder.keyword, "i");

      const and = []
      const or = []

      if (finder.keyword) {
        or.push({ title: { $regex: regex } })
        or.push({ ticker: { $regex: regex } })
        or.push({ description: { $regex: regex } })
        and.push({ $or: or })
      }

      if (finder.date_from && finder.date_to) {
        and.push({
          start_date: {
            $gte: new Date(finder.date_from),
            $lt: new Date(finder.date_to)
          }
        })
      }

      if (finder.price_from && finder.price_to) {
        and.push({
          price: {
            $gte: finder.price_from,
            $lt: finder.price_to
          }
        })
      }

      const query = { $and: and }

      Trip.find(
        query,
        null,
        { limit: max_result },
        (err, trips) => {
          if (trips) {
            finder.trips = trips
            callback()
          }
        }
      )
    }
  })
})

FinderSchema.index({ keyword: 'text' })

module.exports = mongoose.model("Finder", FinderSchema);
