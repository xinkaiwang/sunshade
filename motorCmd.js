#!/usr/bin/env node
'use strict'

var request = require('request');
var promisify = require('bluebird').promisify;
var httpGet = promisify(request.get);

var urlBase = 'http://localhost:8180/api/v1/';

function motorSetPower(pct) {
  var url = urlBase + "power/set/" + pct;
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorGetPower(pct) {
  var url = urlBase + "power/get";
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorGetPos() {
  var url = urlBase + "position/get";
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorGetCurrentSpeed() {
  var url = urlBase + "speed/get";
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorGetCurrentStatus() {
  var url = urlBase + "status/get";
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorPidSpeedOn(rpm) {
  var url = urlBase + "pid/speed/on/" + rpm;
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorMoveTo(pos) {
  var url = urlBase + "moveto/pos/" + pos;
  return httpGet(url).then(function (ret) {return ret.body;});
}

motorPidSpeedOn(4000).then(function (ret) { console.log(ret); });

// motorGetCurrentSpeed()
//   .then(function(powerPct) {console.log("speed="+powerPct);});

// motorSetPower(0).then(console.log);
// motorGetPower()
//   .then(function(powerPct) {console.log("power="+powerPct);});
// motorGetPos().then(console.log);
// motorPidSpeedOn(100).then(console.log);
// motorMoveTo(2000).then(console.log);

function timeout() {
  motorGetCurrentStatus()
  .then(function(status) {console.log("status="+status);});
  setTimeout(timeout, 300);
}
timeout();

setTimeout(function(){
  motorSetPower(0).then(function (ret) { 
    console.log(ret); 
    process.exit(0);
  });
  
}, 4*1000);
