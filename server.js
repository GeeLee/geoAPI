// Get the packages we need
var path = require('path');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var geoDataController = require('./controllers/geoData');
var userController = require('./controllers/user');
var passport = require('passport');
var authController = require('./controllers/auth');
var clientController = require('./controllers/client');
var ejs = require('ejs');
var session = require('express-session');
var oauth2Controller = require('./controllers/oauth2');
var compression = require('compression');
var secrets = require('./config/secrets');

// Connect to the geoAPI MongoDB
mongoose.connect(secrets.db);

// Create our Express application
var app = express();

// Add content compression middleware
app.use(compression({
  threshold: 256
}));

// Setup objects needed by views
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

// Add static middleware
app.use(express.static(__dirname + '/public'));

// Set view engine to ejs
app.set('view engine', 'ejs');

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// Use express session support since OAuth2orize requires it
app.use(session({
  secret: secrets.sessionSecret,
  saveUninitialized: true,
  resave: true
}));

// Use the passport package in our application
app.use(passport.initialize());
app.use(passport.session());

// Create our Express router
var router = express.Router();

// Create endpoint handlers for /geoData
router.route('/geoData')
  .post(authController.isAuthenticated, geoDataController.postGeoData)
  .get(authController.isAuthenticated, geoDataController.getGeoDataAll);

//Create endpoint handlers for /geoData/:geoData_id
router.route('/geoData/:geoData_id')
  .get(authController.isAuthenticated, geoDataController.getGeoData)
  .put(authController.isAuthenticated, geoDataController.putGeoData)
  .delete(authController.isAuthenticated, geoDataController.deleteGeoData);

// Create endpoint handlers for /users
router.route('/users')
  .post(userController.postUsers)
  .get(authController.isAuthenticated, userController.getUsers);

// Create endpoint handlers for /clients
router.route('/clients')
  .post(authController.isAuthenticated, clientController.postClients)
  .get(authController.isAuthenticated, clientController.getClients);

  // Create endpoint handlers for oauth2 authorize
router.route('/oauth2/authorize')
  .get(authController.isAuthenticated, oauth2Controller.authorization)
  .post(authController.isAuthenticated, oauth2Controller.decision);

// Create endpoint handlers for oauth2 token
router.route('/oauth2/token')
  .post(authController.isClientAuthenticated, oauth2Controller.token);
  
// Auth routes
router.get('/auth/twitter', authController.twitter);
router.get('/auth/twitter/callback', authController.twitterCallback, function(req, res) {
  res.redirect(req.session.returnTo || '/');});

router.get('/auth/logout', authController.logout);

// Register all our routes with /api
app.use('/api', router);

// Start the server
app.listen(3000);



