'use strict'
module.exports = function (app) {

  const cube = require('../controllers/cubeController')

  const authController = require('../controllers/authController')

  app.route('/cube/show')
    .get(authController.verifyUser(['ADMINISTRATOR']), cube.show_cube)

  app.route('/cube/compute')
    .put(authController.verifyUser(['ADMINISTRATOR']), cube.compute_cube)

}
