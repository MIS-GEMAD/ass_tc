
const express = require("express");
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require("mongoose");

// creación de los esquemas en MongoDB
// nota: aunque no se usen las variables, los "requires" son obligatorios
const Actor = require("./api/models/actorModel");
const Trip = require("./api/models/tripModel");
const Stage = require("./api/models/stageModel");
const Application = require("./api/models/applicationModel");
const Picture = require("./api/models/pictureModel");
const Configuration = require("./api/models/configurationModel");
const Finder = require("./api/models/finderModel");
const Sponsorship = require("./api/models/sponsorshipModel");
const Dashboard = require("./api/models/dashboardModel");
const Cube = require("./api/models/cubeModel");
const DashboardTools = require('./api/controllers/dashboardController')

// firebase
const admin = require('firebase-admin')
const serviceAccount = require('./acmeexplorerauth-firebase-adminsdk-4r524-aec195acfd')

// body parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// control de CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, idToken') // ojo, que si metemos un parametro propio por la cabecera hay que declararlo aquí para que no de el error CORS
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS')
  next()
})

// para poder usar la API de firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://acmeexplorertauth.firebaseio.com'
})

// Routes
const routesActors = require("./api/routes/actorRoutes");
const routesApplications = require("./api/routes/applicationRoutes");
const routesConfiguration = require("./api/routes/configurationRoutes");
const routesCube = require("./api/routes/cubeRoutes");
const routesFinder = require("./api/routes/finderRoutes");
const routesSponsorships = require("./api/routes/sponsorshipRoutes");
const routesStorage = require('./api/routes/storageRoutes');
const routesTrips = require("./api/routes/tripRoutes");
const routesDashboard = require("./api/routes/dashboardRoutes");
const routesLogin = require("./api/routes/loginRoutes");

routesActors(app);
routesApplications(app);
routesConfiguration(app);
routesCube(app);
routesFinder(app);
routesSponsorships(app);
routesStorage(app)
routesTrips(app);
routesDashboard(app);
routesLogin(app);


// MongoDB URI building
const mongoDBHostname = process.env.mongoDBHostname || "mongodb";
const mongoDBPort = process.env.mongoDBPort || "27017";
const mongoDBName = process.env.mongoDBName || "ACME_Explorer";
const mongoDBURI =
  "mongodb://" + mongoDBHostname + ":" + mongoDBPort + "/" + mongoDBName;

mongoose.connect(mongoDBURI, {autoIndex: false});
console.log("Connecting DB to: " + mongoDBURI);

mongoose.connection.on("open", function () {
  app.listen(port, function () {
    console.log("ACME-Explorer RESTful API server started on: " + port);
  });
});

mongoose.connection.on("error", function (err) {
  console.error("DB init error " + err);
});

mongoose.connection.on("all", function () {
  // save inital configuration variable
  var configuration = new Configuration({
    flat_rate: 0,
    flush_period:1,
    max_finder_result: 10
  })
  
  var cube = new Cube({
    money_in_period: 0,
    explorers_in_period: []
  })
  
  mongoose.connection.dropCollection('configurations')
  mongoose.connection.dropCollection('cubes')
  
  configuration.save()
  
  cube.save()
})

// mongoose.connection.dropDatabase(function(err, result) {console.log(err,result)});

DashboardTools.createDashboardJob();

module.exports = app;
