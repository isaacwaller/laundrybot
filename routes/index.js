var express = require('express');
var router = express.Router();
var laundryManager = require('../laundrymanager');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/state', function(req, res, next) {

  var response = {
    washer: laundryManager.getWasherOrDryer('washer'),
    dryer: laundryManager.getWasherOrDryer('dryer')
  }

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(response));
});

module.exports = router;
