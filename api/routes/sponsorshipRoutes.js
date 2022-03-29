'use strict'
module.exports = function (app) {

  const sponsorship = require('../controllers/sponsorshipController')

  const authController = require('../controllers/authController')

  app.route('/sponsorships')
    .get(authController.verifyUser(['SPONSOR']), sponsorship.list_all_sponsorships)
    .post(authController.verifyUser(['SPONSOR']), sponsorship.create_a_sponsorship)

  app.route('/sponsorships/:sponsorshipId')
    .get(authController.verifyUser(['SPONSOR']), sponsorship.read_a_sponsorship)
    .put(authController.verifyUser(['SPONSOR']), sponsorship.update_a_sponsorship)
    .delete(authController.verifyUser(['SPONSOR']), sponsorship.delete_a_sponsorship)

  app.route('/sponsorships/:sponsorshipId/pay')
    .put(authController.verifyUser(['SPONSOR']), sponsorship.pay_a_sponsorship)
}
