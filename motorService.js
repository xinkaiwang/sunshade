'use strict'

var _ = require('underscore');
var express = require('express');
var app = express();

var motorDev = require('./motorDevice');

// curl http://localhost:8180/api/v1/power/set/100
app.get('/api/v1/power/set/:power', function (req, rsp) {
  var intPct = parseInt(req.params.power, 10);
  console.log('power/set newPowerPct=' + intPct);
  var newPower = motorDev.motorSetPower(intPct);
  rsp.send(''+newPower);
});

// curl http://localhost:8180/api/v1/power/get
app.get('/api/v1/power/get', function (req, rsp) {
  console.log('power/get');
  var newPower = motorDev.motorGetPower();
  rsp.send(''+newPower);
});

app.get('/api/v1/position/get', function (req, rsp) {
  console.log('position/get');
  var pos = motorDev.motorGetPosition();
  rsp.send('' + pos);
});

app.get('/api/v1/position/reset', function (req, rsp) {
  console.log('position/reset');
  // reportActionToServer('off', 'http');
  // if (sunShadeCtr) {
  //     sunShadeCtr.fb();
  // }
  rsp.send('ok');
});

app.get('/api/v1/speed/get', function (req, rsp) {
  console.log('speed/get');
  var rpm = motorDev.motorGetSpeed();

  rsp.send('' + Math.round(rpm));
});

app.get('/api/v1/status/get', function (req, rsp) {
  console.log('status/get');
  var status = motorDev.motorGetStatus();

  rsp.send(JSON.stringify(status));
});

app.get('/api/v1/pid/speed/on/:rpm', function (req, rsp) {
  var rpm = parseInt(req.params.rpm, 10);
  console.log('pid/speed/set rpm='+rpm);
  motorDev.motorTurnOnPid(rpm);
  rsp.send('' + Math.round(rpm));
});

app.get('/api/v1/pid/speed/off', function (req, rsp) {
  console.log('pid/speed/end');
  motorDev.motorTurnOffPid();
  rsp.send('ok');
});

app.get('/api/v1/moveto/pos/:value', function (req, rsp) {
  console.log('moveto pos=' + req.params.value);
  // reportActionToServer('off', 'http');
  // if (sunShadeCtr) {
  //     sunShadeCtr.fb();
  // }
  rsp.send('ok');
});

app.get('/api/v1/movewith/speed/:value', function (req, rsp) {
  console.log('movewith speed=' + req.params.value + 'rpm');
  // reportActionToServer('off', 'http');
  // if (sunShadeCtr) {
  //     sunShadeCtr.fb();
  // }
  rsp.send('ok');
});

app.listen(8180, function() {
  console.log('app listening on port 8180!');
});
