"use strict";

const mongoose = require("mongoose");

const Application = mongoose.model("Application");
const Actor = mongoose.model("Actor");
const Trip = mongoose.model("Trip");

const authController = require('../controllers/authController')

exports.list_all_applications = function (req, res) {
  Application.find({}, function (err, application) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).json(application);
    }
  });
};

exports.create_an_application = async function (req, res) {
  
  const idToken = req.header('idToken')
  let authExplorerId = await authController.getUserId(idToken)
  let explorerId = String(authExplorerId)

  Trip.findById(req.body.trip, async function (err, trip) {
    if (err) {
      res.status(400).send(err);
    } else {
      if (!trip) {
        res.status(404).send("Trip not found");
      } else if (!trip.is_published) {
        res.status(400).send("Trip must been published");
      } else if (trip.start_date < new Date()) {
        res.status(400).send("Trip must not been started");
      } else if (trip.is_cancelled) {
        res.status(400).send("Trip must not been cancelled");
      } else {
         // check if application is unique
         Application.find(
           { trip: trip._id },
           { actor: explorerId },
           {
            $or: [
              { 'status': 'ACCEPTED' },
              { 'status': 'PENDING' }
            ]
            },
           function(err, applications) {
              if (!applications.length) {
              // set application properties
              req.body.status = "PENDING"
              req.body.actor = explorerId

              const newApplication = new Application(req.body);
              newApplication.save(function (error, application) {
                if (error) {
                  res.status(400).send(error);
                } else{
                  // updated the application trip list
                  Trip.findOneAndUpdate({ _id: req.body.trip }, {"$push": {applications: application._id}}, { new: true }, function(err, result){
                    if(err){
                      res.send(err)
                    }
                    else{
                      // updated the application explorer list
                      Actor.findOneAndUpdate({ _id: explorerId}, {"$push": {applications: application._id}}, { new: true }, function(err, result){
                        if(err){
                          res.send(err)
                        }
                        else{
                          res.status(201).json(application);
                        }
                      })

                    }
                  })

                }
              })
             }else {
              res.status(400).send('Cannot apply twice for a trip')
             }
           }
         )
      }
    }
  });

};

exports.read_an_application = async function (req, res) {
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.status(400).send(err);
    } else {

       // check if application is from auth explorer
       const idToken = req.header('idToken')
       let authexplorerId = await authController.getUserId(idToken)
       authexplorerId = String(authexplorerId)
       let applicationExplorerId = application.actor
       applicationExplorerId = String(applicationExplorerId)
 
       if(authexplorerId != applicationExplorerId){
        res.status(401).send({ message: 'This explorer does not have permissions to view this trip', error: err })
       } else{
        res.status(200).json(application);
       }

      
    }
  });
};

exports.cancel_an_application = async function (req, res) {

  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.status(404).send(err);
    } else {

      const idToken = req.header('idToken')
      let authExplorerId = await authController.getUserId(idToken)
      authExplorerId = String(authExplorerId)
      let applicationExplorerId = application.actor
      applicationExplorerId = String(applicationExplorerId)
 
      if(authExplorerId != applicationExplorerId){
        res.status(401).send({ message: 'This explorer does not have permissions to cancel this application'})
      } else{

        if (
          application.status === "PENDING" ||
          application.status === "ACCEPTED"
        ) {
          Application.findOneAndUpdate(
            { _id: req.params.applicationId },
            { status: "CANCELLED" },
            { new: true },
            function (err, application) {
              if (err) {
                res.status(400).send(err);
              } else {
                res.status(201).json(application);
              }
            }
          );
        } else {
          res.status(400).send({ message: 'To cancel an application, must be pending or accepted' })
        }

      }

    }
  });
};

exports.reject_an_application = async function (req, res) {
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.status(404).send(err);
    } else {
      console.log(application)
      Trip.findById(application.trip, async function (err, trip) {
        if (err) {
          res.status(404).send(err);
        } else {
          const idToken = req.header('idToken')
          let authManagerId = await authController.getUserId(idToken)
          authManagerId = String(authManagerId)
          let applicationManagerId = trip.manager
          applicationManagerId = String(applicationManagerId)
    
          if(authManagerId != applicationManagerId){
            res.status(401).send({ message: 'This manager does not have permissions to reject this application'})
          } else{
            if (
              application.status === "PENDING"
            ) {
              Application.findOneAndUpdate(
                { _id: req.params.applicationId },
                { status: "REJECTED" },
                { new: true },
                function (err, application) {
                  if (err) {
                    res.status(400).send(err);
                  } else {
                    res.status(201).json(application);
                  }
                }
              );
            } else {
              res.status(400).send({ err: 'To reject an application, must be pending' })
            }
          }
        }
      })
    }
  });
};

exports.due_an_application = async function (req, res) {
  Application.findById(req.params.applicationId, async function (err, application) {
    if (err) {
      res.status(404).send(err);
    } else {
      Trip.findById(application.trip, async function (err, trip) {
        if (err) {
          res.status(404).send(err);
        } else {
          const idToken = req.header('idToken')
          let authManagerId = await authController.getUserId(idToken)
          authManagerId = String(authManagerId)
          let applicationManagerId = trip.manager
          applicationManagerId = String(applicationManagerId)

          if(authManagerId != applicationManagerId){
            res.status(401).send({ message: 'This manager does not have permissions to due this application'})
          } else{
            if (
              application.status === "PENDING"
            ) {
              Application.findOneAndUpdate(
                { _id: req.params.applicationId },
                { status: "DUE" },
                { new: true },
                function (err, application) {
                  if (err) {
                    res.status(400).send(err);
                  } else {
                    res.status(201).json(application);
                  }
                }
              );
            } else {
              res.status(400).send({ err: 'To due an application, must be pending' })
            }
          }
        }
      })
    }
  });
};

exports.list_applications_from_auth_explorer = async function (req, res) {

  const status = req.query.status ? req.query.status.toUpperCase() : '';

  // get auth explorer
  const idToken = req.header('idToken')
  const explorerId = await authController.getUserId(idToken)

  if (status == '') {
    Application.find({ actor: explorerId}, function (err, applications) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).json(applications);
      }
    });
  } else {
    Application.find({ actor: explorerId}, { status: status}, function (err, applications) {
      if (err) {
        res.status(400).send(err);
      } else {
        res.status(200).json(applications);
      }
    });
  }


}

exports.pay_a_trip = async function (req, res) {

  Application.findById(req.params.applicationId, async function (err, application) {

     // check if application is from auth explorer
     const idToken = req.header('idToken')
     let authExplorerId = await authController.getUserId(idToken)
     authExplorerId = String(authExplorerId)
     let applicationExplorerId = application.actor
     applicationExplorerId = String(applicationExplorerId)

     if(authExplorerId != applicationExplorerId){
      res.status(401).send({ message: 'This explorer does not have permissions to pay this trip'})
     } else {

      if(application.status == "DUE"){

        Application.findOneAndUpdate(
          { _id: req.params.applicationId },
          { status: "ACCEPTED" },
          { new: true },
          function (err, application) {
            if (err) {
              res.status(400).send(err);
            } else {
              res.status(201).json(application);
            }
          }
        );

      } else{
        res.status(401).send({ message: 'The application must be in DUE status'})
      }

     }

    
  });

  /*
Application.findById(req.params.applicationId, function (err, application) {
    let tripId = application.trip

    Trip.findById(tripId, function (err, trip) {

      if (err) {
        res.status(404).send(err);
      } else {
        if (!trip) {
          res.status(404).send("Trip not found");
        } else {
          Actor.findById(req.params.actorId, function (err, actor) {
            if (err) {
              res.status(400).send(err);
            } else {
              if (!actor) {
                res.status(404).send("Actor not found");
              } else if (!actor.role.find((role) => role === "EXPLORER")) {
                res.status(400).send("Actor must be explorer");
              } else {
                if (
                  trip.applications.length > 0 &&
                  actor.applications.length > 0
                ) {
                  var applicationId = "";
                  var exist = false;
                  if (!trip) {
                    res.status(400).send("Trip must be applied");
                  } else {
                    for (let i = 0; i < trip.applications.length; i++) {
                      for (let j = 0; j < actor.applications.length; j++) {
                        if (trip.applications[i].toString() == actor.applications[j].toString()) {
                          exist = true;
                          applicationId = trip.applications[i].toString();
                          break;
                        }
                      }
                    }
  
                    if (!exist) {
                      res.status(400).send("Application not found");
                    } else {
                      Application.findById(
                        applicationId,
                        function (err, application) {
                          if (err) {
                            res.status(400).send(err);
                          } else {
                            if (!application) {
                              res.status(400).send("Application not found");
                            } else {
                              if (application.status !== "DUE") {
                                res.status(400).send("Trip is not due");
                              } else {
                                Application.findOneAndUpdate(
                                  { _id: applicationId },
                                  { status: "ACCEPTED" },
                                  { new: true },
                                  function (err, application) {
                                    if (err) {
                                      res.status(400).send(err);
                                    } else {
                                      res.status(201).json(application);
                                    }
                                  }
                                );
                              }
                            }
                          }
                        }
                      );
                    }
                  }
                } else {
                  res.status(400).send("Application not found");
                }
              }
            }
          });
        }
      }
    });

  })
  */


  
}
