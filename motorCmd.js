#!/usr/bin/env node
'use strict'

var request = require('request');
var promisify = require('bluebird').promisify;
var httpGet = promisify(request.get);

var urlBase = 'http://localhost:8180/api/v1/';

function motorSetPowerPct(pct) {
  var url = urlBase + "power/set/" + pct;
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorGetPower(pct) {
  var url = urlBase + "power/get";
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorGetPos() {
  var url = urlBase + "position/get";
  return httpGet(url).then(function (ret) {return parseFloat(ret.body);});
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

function motorPidSpeedOff() {
  var url = urlBase + "pid/speed/off";
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorMoveToPos(pos, speedRpm) {
  var url = urlBase + "moveto/pos/" + pos + '/' + speedRpm;
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorMoveToPosSe(pos, speedRpm) {
  var url = urlBase + "moveToPosSe/pos/" + pos + '/' + speedRpm;
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorShake() {
  var url = urlBase + "shake";
  return httpGet(url).then(function (ret) {return ret.body;});
}


module.exports = {
  motorSetPowerPct: motorSetPowerPct,
  motorGetPower: motorGetPower,
  motorGetPos: motorGetPos,
  motorGetCurrentSpeed: motorGetCurrentSpeed,
  motorGetCurrentStatus: motorGetCurrentStatus,
  motorPidSpeedOn: motorPidSpeedOn,
  motorPidSpeedOff: motorPidSpeedOff,
  motorMoveToPos: motorMoveToPos,
  motorMoveToPosSe: motorMoveToPosSe,
  motorShake: motorShake,
};
