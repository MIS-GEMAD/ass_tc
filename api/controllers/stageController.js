'use strict'

const mongoose = require('mongoose')

const Trip = mongoose.model('Trip')
const Stage = mongoose.model('Stage')

const authController = require('./authController')

exports.list_all_stages_from_trip = function (req, res) {
  
  Stage.find({ trip: req.params.tripId }, function (err, stages) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).json(stages)
    }
  })

}

exports.create_a_stage = async function (req, res) {
 
  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {
      res.status(404).send(err);
    } else {

      if(trip.is_published) {
        res.status(401).send({ message: 'It is not possible to add stages to a trip that has already been published' })
      } else {

        // check if trip is from auth manager
        const idToken = req.header('idToken')
        let authManagerId = await authController.getUserId(idToken)
        authManagerId = String(authManagerId)
        let tripManagerId = trip.manager
        tripManagerId = String(tripManagerId)

        if(authManagerId != tripManagerId){
          res.status(401).send({ message: 'This manager does not have permissions to create this stage in this trip' })
        } else{

          const newStage = new Stage(req.body)

          // associate stage to a trip
          newStage.trip = req.params.tripId
        
          newStage.save(function (error, stage) {
            if (error) {
              res.status(400).send(error)
            } else {
        
              // updated the stages trip list
              Trip.findOneAndUpdate({ _id: req.params.tripId }, {"$push": {stages: stage._id}}, { new: true }, function(err, result){
                if(err){
                  res.send(err)
                }
                else{
                  res.status(201).json(stage);
                }
              })
        
            }
          })

        }

      }



    }

  });

}

exports.read_a_stage = function (req, res) {
  Stage.findById(req.params.stageId, function (err, stage) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).json(stage)
    }
  })
}

exports.update_a_stage = function (req, res) {

  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {

      res.status(404).send(err);

    } else {

      if(trip.is_published) {
        res.status(401).send({ message: 'It is not possible to edit a stage in a trip that has already been published' })
      } else {

        // check if trip is from auth manager
        const idToken = req.header('idToken')
        let authManagerId = await authController.getUserId(idToken)
        authManagerId = String(authManagerId)
        let tripManagerId = trip.manager
        tripManagerId = String(tripManagerId)

        if(authManagerId != tripManagerId) {
          res.status(401).send({ message: 'This manager does not have permissions to edit this stage', error: err })
        } else{

          Stage.findById(req.params.stageId, function (err, stage) {
            if (err) {
              res.status(404).send(err)
            } else {
              Stage.findOneAndUpdate({ _id: req.params.stageId }, req.body, { new: true }, function (err, stage) {
                if (err) {

                  res.status(400).send(err)

                } else {
                  
                  res.status(201).json(stage)
                }
              })
            }
          })

        }

      }

    }

  });
}

exports.delete_a_stage = function (req, res) {

  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {

      res.status(404).send(err);

    } else {

      if(trip.is_published) {
        res.status(401).send({ message: 'It is not possible to delete a stage in a trip that has already been published' })
      } else {

        // check if trip is from auth manager
        const idToken = req.header('idToken')
        let authManagerId = await authController.getUserId(idToken)
        authManagerId = String(authManagerId)
        let tripManagerId = trip.manager
        tripManagerId = String(tripManagerId)

        if(authManagerId != tripManagerId) {
          res.status(401).send({ message: 'This manager does not have permissions to delete this stage', error: err })
        } else{

          Stage.deleteOne({
            _id: req.params.stageId
          }, function (err, stage) {
            if (err) {
              res.status(404).send(err)
            } else {

              // updated the stages trip list
              Trip.findOneAndUpdate({ _id: req.params.tripId }, {"$pull": {stages: req.params.stageId}}, { new: true }, function(err, result){
                if(err){
                  res.send(err)
                }
                else{
                  res.status(204).json({ message: 'Stage successfully deleted' })
                }
              })
              
            }
          })

        }

      }


    }

  })

}
