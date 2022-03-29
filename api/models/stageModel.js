"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StageSchema = new Schema(
  {
    title: {
      type: String,
      required: 'Kindly enter the title',
    },
    description: {
      type: String,
      required: 'Kindly enter the description',
    },
    price: {
      type: Number,
      min: 0,
      required: 'Kindly enter the price',
    },
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip'
    }
  },
  { strict: true }
);


StageSchema.pre('save', function(callback) {
  const Trip = mongoose.model('Trip')

  const stage_price = this.price

  Trip.findById(this.trip, function (err, trip) {
    if (trip != null){
      const initial_price = trip.price

      const totalPrice = initial_price + stage_price
    
      trip.price = totalPrice
  
      Trip.findOneAndUpdate({ _id: trip._id }, { price: totalPrice }, { new: true }, function (err, trip) {})
    }
  })

  callback()
})

module.exports = mongoose.model("Stage", StageSchema);
