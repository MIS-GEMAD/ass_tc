'use strict'

const async = require('async')
const mongoose = require('mongoose')
const Dashboard = mongoose.model('Dashboard')
const Trip = mongoose.model('Trip')
const Actor = mongoose.model('Actor')
const Application = mongoose.model('Application')
const Finder = mongoose.model('Finder')

exports.list_all_indicators = function (req, res) {
  console.log('Requesting indicators')

  Dashboard.find().sort('-computationMoment').exec(function (err, indicators) {
  if (err) {
    res.send(err)
  } else {
    res.json(indicators)
  }
  })
}

exports.last_indicator = function (req, res) {
  Dashboard.find().sort('-computationMoment').limit(1).exec(function (err, indicators) {
    if (err) {
      res.send(err)
    } else {
      res.json(indicators)
    }
  })
}

exports.stats = function (req, res) {
  Dashboard.findOne({}, {}, { sort: { 'computationMoment' : -1 } }, function(err, dashboard) {
    if (err) {
      res.send(err)
    } else {
      res.json(dashboard)
    }
  });
}

const CronJob = require('cron').CronJob
const CronTime = require('cron').CronTime

// '0 0 * * * *' una hora
// '*/30 * * * * *' cada 30 segundos
// '*/10 * * * * *' cada 10 segundos
// '* * * * * *' cada segundo
let rebuildPeriod = '*/10 * * * * *' // El que se usará por defecto
let computeDashboardJob

exports.rebuildPeriod = function (req, res) {
  res.status(200)
  console.log('Updating rebuild period. Request: period:' + req.query.rebuildPeriod)
  
  // Get Rebuild Period
  rebuildPeriod = req.query.rebuildPeriod
  if(rebuildPeriod == null){
    res.status(400).send('Error: Missing query parameter \'?rebuildPeriod=*/10 * * * * *\' in URI');
  }
    
  // Compute
  computeDashboardJob.setTime(new CronTime(rebuildPeriod))
  computeDashboardJob.start()

  res.json(req.query.rebuildPeriod)
  
}

function createDashboardJob () {
  computeDashboardJob = new CronJob(rebuildPeriod, function () {
    const newDashboard = new Dashboard()
    console.log('Cron job submitted. Rebuild period: ' + rebuildPeriod)
    async.parallel([

      computeTripsByManager,
      computeApplicationsByTrip,
      computeTripsPrice,
      computeRatioApplicationsByStatus,
      computeAveragePriceFinders,
      computeTop10WordsFinders
      
    ], function (err, results) {
      if (err) {
        console.log('Error computing dashboard: ' + err)
      } else {

        newDashboard.trip_stats_by_manager = results[0]
        newDashboard.application_by_trip = results[1]
        newDashboard.trip_price_stats = results[2]
        newDashboard.ratio_applications_by_status = results[3]
        newDashboard.average_price_in_finders = results[4],
        newDashboard.top_10_words_in_finders = results[5],

        newDashboard.rebuildPeriod = rebuildPeriod

        newDashboard.save(function (err, dashboard) {
          if (err) {
            console.log('Error saving dashboard: ' + err)
          } else {
            console.log('new Dashboard succesfully saved. Date: ' + new Date())
          }
        })

      }
    })
  }, null, true, 'Europe/Madrid')
}

module.exports.createDashboardJob = createDashboardJob

function computeTripsByManager (callback) {

  Trip.aggregate([
    {
      $group: {
        _id: '$manager',
        count: { $count: {} }
      }
    },
    {
      $group: {
        _id: 0,
        avg: { $avg: '$count' },
        min: { $min: '$count' },
        max: { $max: '$count' },
        std: { $stdDevSamp: '$count' }
      }
    }
  ], function (err, res) {
      callback(err, res)
    }
  );

}

function computeApplicationsByTrip (callback) {

  Application.aggregate([
    {
      $group: {
        _id: '$trip',
        count: { $count: {} }
      }
    },
    {
      $group: {
        _id: 0,
        avg: { $avg: '$count' },
        min: { $min: '$count' },
        max: { $max: '$count' },
        std: { $stdDevSamp: '$count' }
      }
    }
  ], function (err, res) {
      callback(err, res)
    }
  );

}

function computeTripsPrice (callback) {

  Trip.aggregate([
    { '$group': {
        '_id': 0,
        'avg': { '$avg': "$price" },
        'min': { '$min': "$price" },
        'max': { '$max': "$price" },
        'stdPrice': { $stdDevSamp: '$price' }
    } }
  ], function (err, res) {
      callback(err, res)
    }
  );

}

function computeRatioApplicationsByStatus (callback) {

  Application.count({}, function(error, total){

    if(error) return callback(error);

    Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $count: {} }
        }
      },{
        $project: {
          _id: 0,
          status: '$_id',
          ratio: { $multiply: [{ $divide: [100, total] }, '$count'] }
        }
      }
    ], function (err, res) {
      callback(err, res)
    });

  });
  
}

function computeAveragePriceFinders (callback) {

  Finder.aggregate([
    {
      $group: {
        _id: 0,
        avg_min_price: { $avg: '$price_from' },
        avg_max_price: { $avg: '$price_to' }
      }
    }
  ], function (err, res) {
    callback(err, res)
  });
  
}

function computeTop10WordsFinders (callback) {
  
  Finder.aggregate([
    {
      $group: {
        _id: '$keyword',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        keyword: '$_id',
        count: 1
      }
    },
    { $limit: 10 },
    { $sort: { count: -1 } },
  ], function (err, res) {
    callback(err, res)
  });

}
