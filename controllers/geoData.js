// Load required packages
var geoData = require('../models/geoData');

// Create endpoint /api/geoData for POSTS
exports.postGeoData = function(req, res) {
  // Create a new instance of the geoData model
  var Data = new geoData();

  // Set the beer properties that came from the POST data
  Data.GPSLatitude = req.body.GPSLatitude;
  Data.GPSLongitude = req.body.GPSLongitude;
  Data.Tag = req.body.Tag;
  Data.userId = req.user._id;

    // Save the beer and check for errors
  Data.save(function(err) {
    if (err)
      res.send(err);
    res.json({ message: 'geoData added!', data: Data });
  });
};

// Create endpoint /api/geoDataAll for GET
exports.getGeoDataAll = function(req, res) {
  // Use the geoData model to find all geoData - s
  geoData.find(function(err, datas) {
    if (err)
      res.send(err);

    res.json(datas);
  });
};

// Create endpoint /api/getGeoData/:geoData_id for GET
exports.getGeoData = function(req, res) {
  // Use the geoData model to find a specific Data
  geoData.findById({ userId: req.user._id, _id: req.params.geoData_id }, function(err, datas) {
    if (err)
      res.send(err);

    res.json(datas);
  });
};

// Create endpoint /api/putGeoData/:geoData_id for PUT
exports.putGeoData = function(req, res) {
  // Use the geoData model to find a specific data point
  geoData.update({ userId: req.user._id, _id: req.params.geoData_id }, { Tag: req.body.Tag }, function(err, dataPoint, raw) {
    if (err)
      res.send(err);

    res.json({ message: num + ' updated' });
  });
};

// Create endpoint /api/deleteGeoData/:geoData_id for DELETE
exports.deleteGeoData = function(req, res) {
  // Use the geoData model to find a specific data point and remove it
  geoData.remove({ userId: req.user._id, _id: req.params.geoData_id }, function(err) {
    if (err)
      res.send(err);

    res.json({ message: 'Data point removed!' });
  });
};
