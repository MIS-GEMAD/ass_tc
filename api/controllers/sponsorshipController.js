'use strict'

const mongoose = require('mongoose')

const Sponsorship = mongoose.model('Sponsorship')
const Actor = mongoose.model('Actor')

const authController = require('../controllers/authController')

exports.list_all_sponsorships = async function (req, res) {

  // get auth sponsor
  const idToken = req.header('idToken')
  let authSponsorId = await authController.getUserId(idToken)
  authSponsorId = String(authSponsorId)

  Actor.findById(authSponsorId, function (err, sponsor) {
    if (err) {
      res.status(400).send(err);
    } else{

      Sponsorship.find({actor: authSponsorId, is_paid : true}, function (err, sponsorships) {

        if(!sponsorships) {
          res.status(404).send("There are no paid sponsorships")
        } else {
          if (err) {
            res.status(400).send(err)
          } else {
            res.status(200).json(sponsorships)
          }
        }
        
      })

    }
  });

}

exports.create_a_sponsorship = async function (req, res) {

  // get auth sponsor
  const idToken = req.header('idToken')
  let authSponsorId = await authController.getUserId(idToken)
  authSponsorId = String(authSponsorId)

  Actor.findById(authSponsorId, function (err, sponsor) {
    if (err) {
      res.status(400).send(err);
    } else{
      req.body.actor = authSponsorId
      const newSponsorship = new Sponsorship(req.body)
      newSponsorship.save(function (error, sponsorship) {
        if (error) {
          res.status(400).send(error)
        } else {

          // updated the sponsor sponsorships list
          Actor.findOneAndUpdate({ _id: authSponsorId }, {"$push": {sponsorships: sponsorship._id}}, { new: true }, function(err, result){
            if(err){
              res.send(err)
            }
            else{
              res.status(201).json(sponsorship);
            }
          })

        }
      })
    }
  });

}

exports.read_a_sponsorship = async function (req, res) {

  // get auth sponsor
  const idToken = req.header('idToken')
  let authSponsorId = await authController.getUserId(idToken)
  authSponsorId = String(authSponsorId)

  Actor.findById(authSponsorId, function (err, sponsor) {
    if (err) {
      res.status(400).send(err);
    } else{

      Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
          res.status(404).send(err)
        } else {

          // check if sponsorship owner is me
          if(sponsorship.actor == authSponsorId) {

            if(sponsorship.is_paid) {
              res.status(200).json(sponsorship)
            } else {
              res.status(404).send("The sponsorship does not exist or is not paid yet")
            }

          } else {
            res.status(400).send("This sponsor does not have permissions to update this sponsorship");
          }

        }
      });

    }
  });

}

exports.update_a_sponsorship = async function (req, res) {

  // get auth sponsor
  const idToken = req.header('idToken')
  let authSponsorId = await authController.getUserId(idToken)
  authSponsorId = String(authSponsorId)

  Actor.findById(authSponsorId, function (err, sponsor) {
    if (err) {
      res.status(400).send(err);
    } else {

      Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
          res.status(404).send(err)
        } else {

          // check if sponsorship owner is me
          if(sponsorship.actor == authSponsorId) {

            Sponsorship.findOneAndUpdate({ _id: req.params.sponsorshipId }, req.body, { new: true }, function (err, sponsorship) {
              if (err) {
                res.status(400).send(err)
              } else {
                res.status(201).json(sponsorship)
              }
            })

          } else {
            res.status(400).send("This sponsor does not have permissions to update this sponsorship");
          }

        }
      })

    }
  });

}

exports.delete_a_sponsorship = async function (req, res) {

  // get auth sponsor
  const idToken = req.header('idToken')
  let authSponsorId = await authController.getUserId(idToken)
  authSponsorId = String(authSponsorId)

  Actor.findById(authSponsorId, function (err, sponsor) {
    if (err) {
      res.status(400).send(err);
    } else {

      Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
          res.status(404).send("Sponsor not found")
        } else {

          // check if sponsorship owner is me
          if(sponsorship.actor == authSponsorId) {

            Sponsorship.deleteOne({
              _id: req.params.sponsorshipId
            }, function (err, sponsorship) {
              if (err) {
                res.status(404).send(err)
              } else {
      
                // updated the sponsor sponsorships list
                Actor.findOneAndUpdate({ _id: authSponsorId }, {"$pull": {sponsorships: req.params.sponsorshipId}}, { new: true }, function(err, result){
                  if(err){
                    res.send(err)
                  }
                  else{
                    res.status(204).json({ message: 'Sponsorship successfully deleted' })
                  }
                })
                
              }
            })

          }else {
            res.status(400).send("This sponsor does not have permissions to delete this sponsorship");
          }

        }
      })


    }
  });

}

exports.pay_a_sponsorship = async function (req, res) {

  // get auth sponsor
  const idToken = req.header('idToken')
  let authSponsorId = await authController.getUserId(idToken)
  authSponsorId = String(authSponsorId)

  Actor.findById(authSponsorId, function (err, sponsor) {
    if (err) {
      res.status(400).send(err);
    } else {

      Sponsorship.findById(req.params.sponsorshipId, function (err, sponsorship) {
        if (err) {
          res.status(404).send("Sponsor not found")
        } else {
          if(sponsorship.is_paid === true) {
            res.status(400).send("Sponsorship is already payed");
          } else {

            // check if sponsorship owner is me
            if(sponsorship.actor == authSponsorId) {
              Sponsorship.findOneAndUpdate({ _id: req.params.sponsorshipId }, {is_paid: true}, { new: true }, function (err, sponsorship) {
                if (err) {
                  res.status(400).send(err)
                } else {
                  res.status(201).json(sponsorship)
                }
              })
            } else {
              res.status(400).send("This sponsor does not have permissions to pay this sponsorship");
            }

            
          }
        }
      })

    }
  })

}
