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

function motorMoveToPos(pos, speedRpm) {
  var url = urlBase + "moveto/pos/" + pos + '/' + speedRpm;
  return httpGet(url).then(function (ret) {return ret.body;});
}

function motorMoveToPosSe(pos, speedRpm) {
  var url = urlBase + "moveToPosSe/pos/" + pos + '/' + speedRpm;
  return httpGet(url).then(function (ret) {return ret.body;});
}


module.exports = {
  motorSetPower: motorSetPower,
  motorGetPower: motorGetPower,
  motorGetPos: motorGetPos,
  motorGetCurrentSpeed: motorGetCurrentSpeed,
  motorGetCurrentStatus: motorGetCurrentStatus,
  motorPidSpeedOn: motorPidSpeedOn,
  motorMoveToPos: motorMoveToPos,
  motorMoveToPosSe: motorMoveToPosSe,
};
