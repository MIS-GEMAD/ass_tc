"use strict";

const mongoose = require("mongoose");

const Finder = mongoose.model("Finder");

const Actor = mongoose.model("Actor");

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
      Actor.findOneAndUpdate({ _id: finder.actor._id }, {"$push": {finders: finder._id}}, { new: true }, function(err, result){
        if(err){
          res.send(err)
        }
        else{
          res.status(201).json(finder);
        }
      })
    }
  });
};

exports.list_finders_from_auth_explorer = async function (req, res) {
  const idToken = req.header('idToken')
  const explorerId = await authController.getUserId(idToken)

  Finder.find({ actor: explorerId, trips: { $exists: true, $not: { $size: 0 } } } , function (err, finders) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(finders);
    }
  });
}

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
