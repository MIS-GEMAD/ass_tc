'use strict'
/* ---------------ACTOR Auth---------------------- */
const mongoose = require('mongoose')
const Actor = mongoose.model('Actor')
const admin = require('firebase-admin')

exports.getUserId = async function (idToken) {

  if(idToken == null){
    return null
  }

  const actorFromFB = await admin.auth().verifyIdToken(idToken)
  const uid = actorFromFB.uid

  const mongoActor = await Actor.findOne({ email: uid })
  if (!mongoActor) {
    return null
  } else {
    const id = mongoActor._id
    return id
  }
}

exports.verifyUser = function (requiredRoles) {
  return function (req, res, callback) {
    const idToken = req.header('idToken')

    if(idToken == null){
      res.status(400)
      res.json({ message: 'Missing \'idToken\', add \'idToken\' to Headers and a valid token as a value'})
    }

    admin.auth().verifyIdToken(idToken).then(function (decodedToken) {
      const uid = decodedToken.uid
      const authTime = decodedToken.auth_time
      const exp = decodedToken.exp

      Actor.findOne({ email: uid }, function (err, actor) {
        if (err) {
          res.send(err)
        } else if (!actor) { // No actor found with that email as username
          res.status(401) // an access token isn’t provided, or is invalid
          res.json({ message: 'No actor found with the provided email as username', error: err })
        } else {

          let isAuth = false
          for (let i = 0; i < requiredRoles.length; i++) {
            for (let j = 0; j < actor.role.length; j++) {
              if (requiredRoles[i] === actor.role[j]) {
                if (actor.ban === false) {
                  isAuth = true
                  break
                }
              }
            }
          }
          
          if (isAuth) {
            return callback(null, actor)
          } else {
            res.status(403) // an access token is valid, but requires more privileges
            res.json({ message: 'The actor has not the required roles', error: err })
          }
        }
      })
    }).catch(function (err) {
      // Handle error
      console.log('Error en autenticación: ' + err)
      res.status(403) // an access token is valid, but requires more privileges
      res.json({ message: 'The token is invalid', error: err })
    })
  }
}
