'use strict'
module.exports = function (app) {
  
  const dashboard = require('../controllers/dashboardController')

  const authController = require('../controllers/authController')

  app.route('/dashboard')
    .get(authController.verifyUser(['ADMINISTRATOR']), dashboard.list_all_indicators)
    .post(authController.verifyUser(['ADMINISTRATOR']), dashboard.rebuildPeriod)

  app.route('/dashboard/latest')
    .get(authController.verifyUser(['ADMINISTRATOR']), dashboard.last_indicator)

  app.route('/dashboard/stats')
    .get(authController.verifyUser(['ADMINISTRATOR']), dashboard.stats)

}
