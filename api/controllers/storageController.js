'use strict'

const mongoose = require('mongoose');
const streamToMongoDB = require('stream-to-mongo-db').streamToMongoDB
const JSONStream = require('JSONStream')
const fs = require('fs');
const bcrypt = require("bcrypt");

exports.store_json_fs = function (req, res) {
  let dbURL = null
  let collection = null
  let sourceFile = null
  let batchSize = null
  let parseString = null
  let response = ''

  if (req.query.dbURL && req.query.collection && req.query.sourceFile) {
    dbURL = req.query.dbURL
    collection = req.query.collection
    sourceFile = req.query.sourceFile
    if (req.query.batchSize) batchSize = req.query.batchSize; else batchSize = 1000
    if (req.query.parseString) parseString = req.query.parseString; else parseString = '*'
  
    const outputDBConfig = { dbURL: dbURL, collection: collection, batchSize: batchSize }
  
    const writableStream = streamToMongoDB(outputDBConfig)
  
    console.log('starting streaming the json from file: ' + sourceFile + ', to dbURL: ' + dbURL + ', into the collection: ' + collection)
    fs.createReadStream(sourceFile)
      .pipe(JSONStream.parse(parseString))
      .on('data', function handleRecord(data) {
          data._id = mongoose.Types.ObjectId(data._id)

          if (collection == 'actors') {
            let sponsorship = ''
            let application = ''
            let trip = ''
            let finder = ''

            let new_sponsorships = []
            let new_applications = []
            let new_trips = []
            let new_finders = []

            if (data.sponsorships){
              for (sponsorship of data.sponsorships){
                sponsorship = mongoose.Types.ObjectId(sponsorship)
                new_sponsorships.push(sponsorship)
              }

              data.sponsorships = new_sponsorships
            }

            if (data.applications){
              for (application of data.applications){
                application = mongoose.Types.ObjectId(application)
                new_applications.push(application)
              }

              data.applications = new_applications
            }

            if (data.trips){
              for (trip of data.trips){
                trip = mongoose.Types.ObjectId(trip)
                new_trips.push(trip)
              }

              data.trips = new_trips
            }

            if (data.finders){
              for (finder of data.finders){
                finder = mongoose.Types.ObjectId(finder)
                new_finders.push(finder)
              }

              data.finders = new_finders

              data.create = new Date(data.create)
            }

            data.password = bcrypt.hashSync(data.password, 5);

          }

          if (collection == 'trips') {
            let stage = ''
            let application = ''
            let sponsorship = ''
            let picture = ''

            let new_sponsorships = []
            let new_applications = []
            let new_stages = []
            let new_pictures = []

            if (data.stages){
              for (stage of data.stages){
                stage = mongoose.Types.ObjectId(stage)
                new_stages.push(stage)
              }

              data.stages = new_stages
            }

            if (data.applications){
              for (application of data.applications){
                application = mongoose.Types.ObjectId(application)
                new_applications.push(application)
              }

              data.applications = new_applications
            }

            if (data.sponsorships){
              for (sponsorship of data.sponsorships){
                sponsorship = mongoose.Types.ObjectId(sponsorship)
                new_sponsorships.push(sponsorship)
              }

              data.sponsorships = new_sponsorships
            }

            if (data.pictures){
              for (picture of data.pictures){
                picture = mongoose.Types.ObjectId(picture)
                new_pictures.push(picture)
              }

              data.pictures = new_pictures
            }

            data.manager = mongoose.Types.ObjectId(data.manager)

            data.start_date = new Date(data.start_date)

            data.end_date = new Date(data.end_date)
          }

          if (collection == 'stages') {
            data.trip = mongoose.Types.ObjectId(data.trip)
          }

          if (collection == 'applications') {
            data.trip = mongoose.Types.ObjectId(data.trip)
            data.actor = mongoose.Types.ObjectId(data.actor)
            data.moment = new Date(data.moment)
          }

          if (collection == 'sponsorships') {
            data.trip = mongoose.Types.ObjectId(data.trip)
            data.actor = mongoose.Types.ObjectId(data.actor)
          }

          if (collection == 'finders') {
            data.actor = mongoose.Types.ObjectId(data.actor)
            data.date_from = new Date(data.date_from)
            data.date_to = new Date(data.date_to)
          }

          if (collection == 'pictures') {
            data.trip = mongoose.Types.ObjectId(data.trip)
          }

				}
			)
      .pipe(writableStream)
      .on('finish', function () {
        response += 'All documents stored in the collection!'
        console.log(response)
        res.send(response)
      })
      .on('error', function (err) {
        console.log(err)
        res.send(err)
      })
  } else {
    if (req.query.dbURL == null) response += 'A mandatory dbURL parameter is missed.\n'
    if (req.query.collection == null) response += 'A mandatory collection parameter is missed.\n'
    if (req.query.sourceFile == null) response += 'A mandatory sourceFile parameter is missed.\n'
    console.log(response)
    res.send(response)
  }
}