var express = require('express');
var router = express.Router();
var laundryManager = require('../laundrymanager');



function createStateResponse() {
  var response = {
    washer: laundryManager.getWasherOrDryer('washer'),
    dryer: laundryManager.getWasherOrDryer('dryer')
  };
  return response;
}

// Home page
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/state', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(createStateResponse()));
});

router.post('/start_from_idle', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  var washerOrDryer = req.body.washer_or_dryer;
  laundryManager.startFromIdle(washerOrDryer);

  res.send(JSON.stringify(createStateResponse()));
});

router.post('/cancel', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  var washerOrDryer = req.body.washer_or_dryer;
  laundryManager.cancel(washerOrDryer);

  res.send(JSON.stringify(createStateResponse()));
});

router.post('/choose_person', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  var washerOrDryer = req.body.washer_or_dryer;
  var person = req.body.person;
  laundryManager.choosePerson(washerOrDryer, person);

  res.send(JSON.stringify(createStateResponse()));
});

router.post('/choose_ok_for_dryer', function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');

  var washerOrDryer = req.body.washer_or_dryer;
  var okForDryer = req.body.ok_for_dryer;
  laundryManager.chooseOkForDryer(washerOrDryer, okForDryer);

  res.send(JSON.stringify(createStateResponse()));
});

module.exports = router;
