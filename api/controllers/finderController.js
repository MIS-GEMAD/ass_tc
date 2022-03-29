"use strict";

const mongoose = require("mongoose");

const Finder = mongoose.model("Finder");

const Configuration = mongoose.model("Configuration");

const authController = require('../controllers/authController')

exports.create_a_finder_criteria = async function (req, res) {

  // get auth explorer
  const idToken = req.header('idToken')
  let authExplorerId = await authController.getUserId(idToken)
  authExplorerId = String(authExplorerId)

  // add explorer to finder
  req.body.actor = authExplorerId
  const newFinder = new Finder(req.body);

  newFinder.save(function (error, finder) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.status(200).json(finder);
    }
  });
};

exports.flush_finder_criterias = function (req, res) {
  Configuration.find({}, function (err, configurations) {
    const configuration = configurations[0]
    if (err) {
      res.status(404).send(err)
    } else {
      Finder.find({}, async function (err, finders) {
        for (const finder of finders) {
          const now = new Date()
          const flush_period = configuration.flush_finder_criterias 
          if (finder.moment.getHours() <= now.getHours()) {
            Finder.updateOne({ _id: finder._id }, { $set: { trips: [] } }, function(err, finder){ });
          }
        }
        res.status(201).send('All finders flushed!')
      })
    }
  })
}
