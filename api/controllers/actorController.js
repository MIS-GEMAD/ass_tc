'use strict'

const mongoose = require('mongoose')

const Actor = mongoose.model('Actor')
const Application = mongoose.model('Application')
const admin = require('firebase-admin')
const authController = require('./authController')

exports.list_all_actors = async function(req, res) {
  try{
    const actors = await Actor.find();
    return res.status(200).json(actors);
  
  }catch(err){
    console.log(err);
  }
}

exports.create_an_actor = function (req, res) {
  const newActor = new Actor(req.body)
  if (req.body.role == 'ADMINISTRATOR' || req.body.role == 'MANAGER') {
    res.status(400).send({ err: 'An administrator or a manager cannot be registered' });
  } else {
    newActor.save(function (err, actor) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).json(actor)
      }
    })
  }
}

exports.create_a_manager = function (req, res) {
  req.body.role = 'MANAGER'
  const newActor = new Actor(req.body)
  newActor.save(function (err, actor) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(201).json(actor)
    }
  })
}

exports.read_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, function (err, actor) {
    if (err) {
      res.status(400).send(err)
    } else {
      res.status(200).json(actor)
    }
  })
}

exports.login_an_actor = async function (req, res) {
  console.log('starting login an actor')
  const emailParam = req.query.email
  const password = req.query.password
  let customToken

  Actor.findOne({ email: emailParam }, function (err, actor) {
    if (err) { // No actor found with that email as username
      res.send(err)
    } else if (!actor) { // an access token isn’t provided, or is invalid
      res.status(401)
      res.json({ message: 'forbidden', error: err })
    } else if ((actor.role.includes('ADMINISTRATOR')) && (actor.validated === false)) { // an access token is valid, but requires more privileges
      res.status(403)
      res.json({ message: 'forbidden', error: err })
    } else {
      // Make sure the password is correct
      actor.verifyPassword(password, async function (err, isMatch) {
        if (err) {
          res.send(err)
        } else if (!isMatch) { // Password did not match
          res.status(401) // an access token isn’t provided, or is invalid
          res.json({ message: 'forbidden', error: err })
        } else {
          try {
            customToken = await admin.auth().createCustomToken(actor.email)
          } catch (error) {
            console.log('Error creating custom token:', error)
          }
          console.log("Login Success... sending JSON with custom token");
          actor.customToken = customToken
          actor.save(function (err, item) {
            if (err) {
              res.send(err)
            } else {
              res.json(item)
            }
          })
        }
      })
    }
  })
}

exports.update_a_verified_actor = function (req, res) {

  console.log('Starting to update the verified actor...')

  Actor.findById(req.params.actorId, async function (err, actor) {
    if (err) {
      res.send(err)
    } else{
      const idToken = req.header('idToken')

      console.log('idToken (actorController): ' + idToken)

      const authenticatedUserId = await authController.getUserId(idToken)

      console.log('Attempt to update the actor with id: ' + authenticatedUserId)

      if (authenticatedUserId == req.params.actorId) {

        console.log('authenticatedUserId is the same as itself')
        
        Actor.findOneAndUpdate({ _id: req.params.actorId }, req.body, { new: true }, function (err2, actor2) {
          
          if (err2) {
            res.status(400).send(err2)
          } else {
            res.status(201).json(actor2)
          }

        })

      } else {
        res.status(403)
        res.send('The Actor is trying to update an Actor that is not himself!')
      }
    }
  });

}

exports.ban_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, async function (err, actor) {
    if (err) {
      res.status(404).send(err);
    } else {
      if (!actor) {
        res.status(404).send("Actor not found");
      } else {
        const idToken = req.header('idToken')
        let authAdministratorId = await authController.getUserId(idToken)
        authAdministratorId = String(authAdministratorId);
        if(authAdministratorId === req.params.actorId) {
          res.send('Actor cannot ban himself')
        } else {
          Actor.findOneAndUpdate({ _id: req.params.actorId }, { ban: true }, { new: true }, function (err, actor) {
            if (err) {
              res.status(400).send(err)
            } else {
              res.status(200).json(actor)
            }
          })
        }
      }
    }
  });
}

exports.unban_an_actor = function (req, res) {
  Actor.findById(req.params.actorId, async function (err, actor) {
    if (err) {
      res.status(404).send(err);
    } else {
      if (!actor) {
        res.status(404).send("Actor not found");
      } else {
        const idToken = req.header('idToken')
        let authAdministratorId = await authController.getUserId(idToken)
        authAdministratorId = String(authAdministratorId);
        if(authAdministratorId === req.params.actorId) {
          res.send('Actor cannot unban himself')
        } else {
          Actor.findOneAndUpdate({ _id: req.params.actorId }, { ban: false }, { new: true }, function (err, actor) {
            if (err) {
              res.status(400).send(err)
            } else {
              res.status(200).json(actor)
            }
          })
        }
      }
    }
  });
}

exports.update_preferred_languaje = async function (req, res) {

  const idToken = req.header('idToken')
  let authActorId = await authController.getUserId(idToken)
  authActorId = String(authActorId);

  Actor.findById(authActorId, function (err, actor) {

    Actor.findOneAndUpdate({ _id: authActorId }, req.body, { new: true }, function (err, actor) {
      if (err) {
        res.status(400).send(err)
      } else {
        res.status(201).json(actor)
      }
    })

  });


}
