'use strict'
module.exports = function (app) {

  const storage = require('../controllers/storageController')

  app.route('/storage/fs')
    .post(storage.store_json_fs)

}