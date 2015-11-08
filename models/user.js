// Load required packages
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var secrets = require('../config/secrets');

// Define our user schema
var UserSchema = new mongoose.Schema({
  twitterId: { type: String, unique: true, required: true },
  username: { type: String, unique: true, lowercase: true, required: true },
  email: { type: String, lowercase: true },
  name: { type: String, default: '' },
  created: { type: Date, default: new Date() },
  accessToken: { type: String, required: true },
  tokenSecret: { type: String, required: true }
});

UserSchema.methods.encrypt = function(text) {
  var algorithm = secrets.cryptos.algorithm;
  var key = secrets.cryptos.key;

  var cipher = crypto.createCipher(algorithm, key);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
};

UserSchema.methods.decrypt = function(text) {
  var algorithm = secrets.cryptos.algorithm;
  var key = secrets.cryptos.key;

  var decipher = crypto.createDecipher(algorithm, key);
  return decipher.update(text, 'hex', 'utf8') + decipher.final('utf8');
};


// Execute before each user.save() call
UserSchema.pre('save', function(callback) {
  var user = this;

  // Break out if the password hasn't changed
  if (!user.isModified('password')) return callback();

  // Password changed so we need to hash it
  bcrypt.genSalt(5, function(err, salt) {
    if (err) return callback(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return callback(err);
      user.password = hash;
      callback();
    });
  });
});


UserSchema.methods.verifyPassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


// Export the Mongoose model
module.exports = mongoose.model('User', UserSchema);