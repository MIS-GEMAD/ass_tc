'use strict'
module.exports = function (app) {

  const trip = require('../controllers/tripController')

  const stage = require('../controllers/stageController')

  const authController = require('../controllers/authController')

  app.route('/trips')
    .get(trip.list_all_trips)
    .post(authController.verifyUser(['MANAGER']), trip.create_a_trip)

  app.route('/trips/owns')
    .get(authController.verifyUser(['MANAGER']), trip.list_trips_from_auth_manager)

  app.route('/trips/:tripId')
    .get(trip.read_a_trip)
    .put(authController.verifyUser(['MANAGER']), trip.update_a_trip)
    .delete(authController.verifyUser(['MANAGER']), trip.delete_a_trip)

  app.route('/trips/:tripId/cancel')
    .put(authController.verifyUser(['MANAGER']), trip.cancel_a_trip)

  app.route('/trips/:tripId/stages')
    .get(stage.list_all_stages_from_trip)
    .post(authController.verifyUser(['MANAGER']), stage.create_a_stage)

  app.route('/trips/:tripId/stages/:stageId')
    .get(stage.read_a_stage)
    .put(authController.verifyUser(['MANAGER']), stage.update_a_stage)
    .delete(authController.verifyUser(['MANAGER']), stage.delete_a_stage)

  app.route('/trip/:tripId/applications')
    .get(authController.verifyUser(['MANAGER']), trip.list_trip_applications)

  /*


  app.route('/trips/:tripId/random-banner')
    .get(trip.select_random_banner)

  */
}
