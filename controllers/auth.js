// Load required packages
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var User = require('../models/user');
var Client = require('../models/client');
var BearerStrategy = require('passport-http-bearer').Strategy
var TwitterStrategy = require('passport-twitter').Strategy;
var Token = require('../models/token');
var secrets = require('../config/secrets');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new BasicStrategy(
  function(username, password, callback) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return callback(err); }

      // No user found with that username
      if (!user) { return callback(null, false); }

      // Make sure the password is correct
      user.verifyPassword(password, function(err, isMatch) {
        if (err) { return callback(err); }

        // Password did not match
        if (!isMatch) { return callback(null, false); }

        // Success
        return callback(null, user);
      });
    });
  }
));

passport.use('client-basic', new BasicStrategy(
  function(username, password, callback) {
    Client.findOne({ id: username }, function (err, client) {
      if (err) { return callback(err); }

      // No client found with that id or bad password
      if (!client || client.secret !== password) { return callback(null, false); }

      // Success
      return callback(null, client);
    });
  }
));

passport.use(new BearerStrategy(
  function(accessToken, callback) {
    Token.findOne({value: accessToken }, function (err, token) {
      if (err) { return callback(err); }

      // No token found
      if (!token) { return callback(null, false); }

      User.findOne({ _id: token.userId }, function (err, user) {
        if (err) { return callback(err); }

        // No user found
        if (!user) { return callback(null, false); }

        // Simple example with no scope
        callback(null, user, { scope: '*' });
      });
    });
  }
));

passport.use(new TwitterStrategy(secrets.twitter, function(req, accessToken, tokenSecret, profile, done) {
  User.findOne({ twitterId: profile.id }, function(err, existingUser) {
    if (existingUser) return done(null, existingUser);

    var user = new User();

    user.twitterId = profile.id;
    user.username = profile.id;
    user.email = '';
    user.name = profile.displayName;
    user.created = new Date();
    user.accessToken = user.encrypt(accessToken);
    user.tokenSecret = user.encrypt(tokenSecret);

    user.save(function(err) {
      done(err, user);
    });
  });
}));

exports.logout = function(req, res) {
  req.logout();
  req.session.destroy();
  res.redirect('/');
};

exports.isAuthenticated = passport.authenticate(['basic', 'bearer'], { session : false });
exports.isClientAuthenticated = passport.authenticate('client-basic', { session : false });
exports.isBearerAuthenticated = passport.authenticate('bearer', { session: false });
exports.twitter = passport.authenticate('twitter');
exports.twitterCallback = passport.authenticate('twitter', { failureRedirect: '/' });