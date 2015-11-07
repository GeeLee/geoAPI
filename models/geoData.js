// Load required packages
var mongoose = require('mongoose');

// Define our geoData schema
var geoDataSchema   = new mongoose.Schema({
  GPSLatitude: Number,
  GPSLongitude: Number,
  Tag: String,
  userId: String
});

// Export the Mongoose model
module.exports = mongoose.model('geoData', geoDataSchema);
