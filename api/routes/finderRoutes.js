'use strict'
module.exports = function (app) {

  const finder = require('../controllers/finderController')

  const authController = require('../controllers/authController')

  app.route('/finder')
    .post(authController.verifyUser(['EXPLORER']), finder.create_a_finder_criteria)

  app.route('/finder/owns')
    .get(authController.verifyUser(['EXPLORER']), finder.list_finders_from_auth_explorer)

  app.route('/finder/flush')
    .put(authController.verifyUser(['ADMINISTRATOR']), finder.flush_finder_criterias)

}
