"use strict";

const mongoose = require("mongoose");

const Trip = mongoose.model("Trip");
const Stage = mongoose.model("Stage");
const Application = mongoose.model("Application");
const Actor = mongoose.model("Actor");
const Sponsorship = mongoose.model("Sponsorship");

const authController = require('./authController')

exports.list_all_trips = function (req, res) {
  Trip.find({}, function (err, trip) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(trip);
    }
  });
};

exports.create_a_trip = async function (req, res) {
  const newTrip = new Trip(req.body)

  // associate manager to trip
  const idToken = req.header('idToken')
  const managerId = await authController.getUserId(idToken)
  newTrip.manager = managerId

  newTrip.save(function (err, trip) {
    if (err) {
      res.status(400).send(err);
    } else {

      // updated the manager trip list
      Actor.findOneAndUpdate({ _id: trip.manager._id }, {"$push": {trips: trip._id}}, { new: true }, function(err, result){
        if(err){
          res.send(err)
        }
        else{
          res.status(201).json(trip);
        }
      })

      
    }
  });
};

exports.read_a_trip = function (req, res) {
  Trip.findById(req.params.tripId, function (err, trip) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(trip);
    }
  });
};

exports.update_a_trip = async function (req, res) {

  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {
      res.status(404).send(err);
    } else {

      // check if trip is from auth manager
      const idToken = req.header('idToken')
      let authManagerId = await authController.getUserId(idToken)
      authManagerId = String(authManagerId)
      let tripManagerId = trip.manager
      tripManagerId = String(tripManagerId)

      if(authManagerId != tripManagerId){
        res.status(401).send({ message: 'This manager does not have permissions to edit this trip', error: err })
      } else{
        if( !trip.is_published ) {
          Trip.findOneAndUpdate({ _id: req.params.tripId }, req.body, { new: true }, function (err, trip) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.status(200).json(trip);
              }
          });
        } else {
        res.status(400).send({ err: 'Cannot update a published trip' });
      }
      }

      
    }
  })
};

exports.delete_a_trip = async function (req, res) {
  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {
      res.status(404).send(err);
    } else {

      // check if trip is from auth manager
      const idToken = req.header('idToken')
      let authManagerId = await authController.getUserId(idToken)
      authManagerId = String(authManagerId)
      let tripManagerId = trip.manager
      tripManagerId = String(tripManagerId)

      if(authManagerId != tripManagerId){
        res.status(401).send({ message: 'This manager does not have permissions to delete this trip'})
      } else {
        if( !trip.is_published ) {
          Trip.deleteOne({ _id: req.params.tripId }, function (err, trip) {
            if (err) {
              res.status(400).send(err);
            } else {

              // updated the manager trip list
              Actor.findOneAndUpdate({ _id: authManagerId }, {"$pull": {trips: req.params.tripId}}, { new: true }, function(err, result){
                if(err){
                  res.send(err)
                }
                else{

                  // delete all stages
                  Stage.deleteMany({ trip: req.params.tripId }, function(err){
                    console.log("deleting stages from trip " + req.params.tripId )
                    res.status(204).send ({ message: "Trip successfully deleted" });
                  })

                }
              })

            }
          });
        } else {
          res.status(400).send({ err: 'Cannot delete a published trip' });
        }
      }

      
    }
  });
};

exports.list_trips_from_auth_manager = async function (req, res) {
  const idToken = req.header('idToken')
  const managerId = await authController.getUserId(idToken)
  Trip.find({ manager: managerId }, function (err, trips) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(trips);
    }
  });
};

exports.cancel_a_trip = async function (req, res) {
  
  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {
      res.status(404).send(err)
    } else {
       // check if trip is from auth manager
       const idToken = req.header('idToken')
       let authManagerId = await authController.getUserId(idToken)
       authManagerId = String(authManagerId)
       let tripManagerId = trip.manager
       tripManagerId = String(tripManagerId)
       if(authManagerId != tripManagerId){
         res.status(401).send({ message: 'This manager does not have permissions to cancel this trip'})
       } else {
        Application.find({ trip: req.params.tripId, status: 'ACCEPTED' }, function (err, applications) {
          if (err) {
            res.status(404).send(err)
          } else {
            if (
              trip.is_published &&
              Date.now() < trip.start_date &&
              applications.length == 0
            ) {
              Trip.findOneAndUpdate(
                { _id: req.params.tripId },
                { status: "CANCELLED", is_cancelled: true },
                { new: true },
                function (err, trip) {
                  if (err) {
                    res.status(400).send(err)
                  } else {
                    res.status(201).json(trip)
                  }
                }
              )
            } else {
              res.status(400).send({ err: 'The trip are not published, have started or have accepted applications'})
            }
          }    
        })

       }
    }
  })
};

exports.select_random_banner = function (req, res) {
  Trip.findById(req.params.tripId, function (err, trip) {
    if (err) {
      res.status(400).send(err);
    } else {
      if (!trip) {
        res.status(404).send("Trip not found");
      } else {
        Sponsorship.find({trip: trip._id.toString(), $set: { is_paid: true }}, function (err, sponsorships) {
          console.log(err,sponsorships)
          if (err) {
            res.status(400).send(err);
          } else {
            if (!sponsorships) {
              res.status(404).send("Sponsorships not found");
            } else {
              var random = Math.floor(Math.random() * sponsorships.length)
              res.status(200).json(sponsorships[random]);
            }
          }
        })
      }
    }
  });
};

exports.list_trip_applications = function (req, res) {
  Trip.findById(req.params.tripId, async function (err, trip) {
    if (err) {
      res.status(404).send(err)
    } else {
      const idToken = req.header('idToken')
      let authManagerId = await authController.getUserId(idToken)
      authManagerId = String(authManagerId)
      let tripManagerId = trip.manager
      tripManagerId = String(tripManagerId)
      if(authManagerId != tripManagerId){
        res.status(401).send({ message: 'This manager does not have permissions to list this trip applications'})
      } else {
        Application.find(
          { trip: req.params.tripId },
          function (err, applications) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.status(200).json(applications);
            }
          }
        )
      }
    }
  })
};
