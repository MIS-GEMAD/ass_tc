'use strict'

const mongoose = require('mongoose')

const Configuration = mongoose.model('Configuration')

exports.updates_rate = function (req, res) {
  Configuration.find({}, function (err, configurations) {
    if (err) {
      res.status(404).send(err)
    } else {
      const configuration = configurations[0]
      Configuration.findOneAndUpdate({ _id: configuration._id }, req.body, { new: true }, function (err, configuration) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.status(201).json(configuration)
        }
      })
    }
  })
}

exports.updates_period = function (req, res) {
  Configuration.find({}, function (err, configurations) {
    if (err) {
      res.status(404).send(err)
    } else {
      const configuration = configurations[0]
      Configuration.findOneAndUpdate({ _id: configuration._id }, req.body, { new: true }, function (err, configuration) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.status(201).json(configuration)
        }
      })
    }
  })
}

exports.updates_finder_result = function (req, res) {
  Configuration.find({}, function (err, configurations) {
    if (err) {
      res.status(404).send(err)
    } else {
      const configuration = configurations[0]
      Configuration.findOneAndUpdate({ _id: configuration._id }, req.body, { new: true }, function (err, configuration) {
        if (err) {
          res.status(400).send(err)
        } else {
          res.status(201).json(configuration)
        }
      })
    }
  })
}
