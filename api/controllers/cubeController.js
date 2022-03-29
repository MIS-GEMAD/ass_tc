'use strict'

const async = require('async')
const mongoose = require('mongoose')
const Cube = mongoose.model('Cube')
const Trip = mongoose.model('Trip')
const Actor = mongoose.model('Actor')

exports.show_cube = function (req, res) {
  Cube.find({}, function (err, cubes) {
    if (err) {
      res.send(err)
    } else {
      res.json(cubes[0])
    }
  })
}

exports.compute_cube = function (req, res) {
  Cube.find({}, function (err, cubes) {
    const cube = cubes[0]
    const actor_id = mongoose.Types.ObjectId(req.body.actor)
    const date_from = new Date(req.body.date_from)
    const date_to = new Date(req.body.date_to)
    const arbitrary_money = req.body.arbitrary_money
    const comparision = req.body.comparision

    async.parallel([
      async.apply(money_in_period, actor_id, date_from, date_to),
      async.apply(explorers_in_period, arbitrary_money, comparision, date_from, date_to)
    ], function (err, results) {
      if (err) {
        console.log('Error computing dashboard: ' + err)
      } else {

        cube.money_in_period = results[0][0].sum
        cube.explorers_in_period = results[1]

        cube.save(function (err, cube) {
          if (err) {
            console.log('Error saving cube: ' + err)
          } else {
            console.log('New cube succesfully saved. Date: ' + new Date())
            res.status(201).json(cube)
          }
        })
      }
    })
  })
}

function money_in_period (actor_id, date_from, date_to, callback) {
  Trip.aggregate([
    {
      $lookup: {
        from: 'applications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications'
      }
    },
    {
      $match: {
        'applications.actor': actor_id,
        'applications.status': 'ACCEPTED',
        'applications.moment': {
          $gte: date_from,
          $lt: date_to
        }
      }
    },
    {
      $group: {
        _id: null,
        sum: { $sum: '$price' }
      }
    }
  ], 
  function (err, res) {
    callback(err, res)
  }
  );
}

function explorers_in_period (arbitrary_money, comparision, date_from, date_to, callback) {
  let comp = {}

  if (comparision == '<') {
    comp["$lt"] = arbitrary_money
  } else if (comparision == '>'){
    comp["$gt"] = arbitrary_money
  } else if (comparision == '<=') {
    comp["$lte"] = arbitrary_money
  } else if (comparision == '>=') {
    comp["$gte"] = arbitrary_money
  } else if (comparision == '==') {
    comp["$eq"] = arbitrary_money
  } else if (comparision == '!=') {
    comp["$ne"] = arbitrary_money
  }

  Actor.aggregate([
    {
      $lookup: {
        from: 'applications',
        localField: 'applications',
        foreignField: '_id',
        as: 'applications'
      }
    },
    {
      $unwind: {
        path: "$applications",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'trips',
        localField: 'applications.trip',
        foreignField: '_id',
        as: 'applications.trip'
      }
    },
    {
      $match: {
        'applications.status': 'ACCEPTED',
        'applications.moment': {
          $gte: date_from,
          $lt: date_to
        }
      }
    },
    {
      $unwind: {
        path: "$applications.trip",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: '$_id',
        sum: { $sum: '$applications.trip.price' }
      }
    },
    {
      $match: {
        sum: comp
      }
    }
  ], 
  function (err, res) {
    callback(err, res)
  }
  );
}
