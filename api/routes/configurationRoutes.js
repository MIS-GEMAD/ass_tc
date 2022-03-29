'use strict'
module.exports = function (app) {

  const configuration = require('../controllers/configurationController')

  const authController = require('../controllers/authController')

  app.route('/rate')
    .put(authController.verifyUser(['ADMINISTRATOR']), configuration.updates_rate)

  app.route('/period')
    .put(authController.verifyUser(['ADMINISTRATOR']), configuration.updates_period)

  app.route('/finder/result')
    .put(authController.verifyUser(['ADMINISTRATOR']), configuration.updates_finder_result)

}