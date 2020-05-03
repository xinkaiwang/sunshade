#!/usr/bin/env node

'use strict'

var _ = require('underscore');
var Promise = require('bluebird');
var express = require('express');
var app = express();

var motorDev = require('./motorDevice');
var moveToCtl = require('./motorMoveToCtl');

motorDev.loadStoredPosition().then(function(pos) {
  console.log('loadStoredPosition() completed pos=' + pos);
});

// curl http://localhost:8180/api/v1/power/set/100
app.get('/api/v1/power/set/:power', function (req, rsp) {
  var intPct = parseInt(req.params.power, 10);
  console.log('power/set newPowerPct=' + intPct);
  moveToCtl.abortAll();
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
  var status = motorDev.motorGetStatus();
  var statusStr = JSON.stringify(status);
  console.log('status/get status='+statusStr);
  rsp.send(statusStr);
});

app.get('/api/v1/pid/speed/on/:rpm', function (req, rsp) {
  var rpm = parseInt(req.params.rpm, 10);
  console.log('pid/speed/set rpm='+rpm);
  moveToCtl.abortAll();
  motorDev.motorTurnOnPid(rpm);
  rsp.send('' + Math.round(rpm));
});

app.get('/api/v1/pid/speed/off', function (req, rsp) {
  console.log('pid/speed/end');
  moveToCtl.abortAll();
  motorDev.motorTurnOffPid();
  rsp.send('ok');
});

app.get('/api/v1/moveto/pos/:targetPos/:speedRpm', function (req, rsp) {
  var targetPos = parseFloat(req.params.targetPos);
  var speedRpm = parseFloat(req.params.speedRpm);
  console.log('moveto pos=' + targetPos);
  moveToCtl.moveToPos(targetPos, speedRpm, true).then(console.log).catch(function(err) {
    console.log('moveto/pos(): failed, err='+err);
  });
  rsp.send('ok');
});

app.get('/api/v1/moveToPosSe/pos/:targetPos/:speedRpm', function (req, rsp) {
  var targetPos = parseFloat(req.params.targetPos);
  var speedRpm = parseFloat(req.params.speedRpm);
  console.log('moveToPosSe pos=' + targetPos);
  moveToCtl.moveToPosWithSoftStartEnd(targetPos, speedRpm).then(console.log).catch(console.err);
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

app.get('/api/v1/shake', function (req, rsp) {
  console.log('shake');
  var pct = 40;
  motorDev.motorSetPower(pct);
  Promise.delay(100).then(function() {
    motorDev.motorSetPower(0);
  }).delay(200).then(function() {
    motorDev.motorSetPower(-pct);
  }).delay(100).then(function() {
    motorDev.motorSetPower(0);
  });
  rsp.send('ok');
});

app.listen(8180, function() {
  console.log('app listening on port 8180!');
});
