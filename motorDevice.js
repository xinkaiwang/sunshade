'use strict'

var motorlib = require('perf-gpio').motor();
var config = require('./config');

var posMonitor = require('./posMonitor')();
var motor = motorlib(config.motorPinA, config.motorPinB);

var currentPowerPct = 0;

// Lot's motor from taobao this is 13, which means: for each motor rotation,
// 13 QD signal will be generated.
var motorSensorRatio = config.motorSensorRatio;
var tickTimeInMS = 40; // 100ms

function speedQdToRpm(speedInQdPerTick) {
  return speedInQdPerTick * (60*1000/tickTimeInMS) / motorSensorRatio;
}

var pidEnabled = false;
var targetSpeedRpm = 0.0; // this is always in RPM
var currentSpeed = 0.0; // this is always in QD/tick
var currentSpeedRpm = speedQdToRpm(currentSpeed);

var pos = 20000;

var safetyCapPct = 100;
function setPorweInternal(pct) {
  if (pct < -safetyCapPct) {
    pct = -safetyCapPct;
  } else if (pct > safetyCapPct) {
    pct = safetyCapPct;
  }
  motor(pct/100);
}

function motorSetPower(pct) {
  if (pct < -100) {
    pct = -100;
  } else if (pct > 100) {
    pct = 100;
  }
  pidEnabled = false;
  currentPowerPct = pct;
  setPorweInternal(currentPowerPct);
  return currentPowerPct;
}

function motorGetPower() {
  return currentPowerPct;
}

function motorGetPosition() {
  return pos;
}

// this will get called every other 10ms
// we will implement a P.I.D. control here
var pid_lastError = targetSpeedRpm - currentSpeedRpm;
var pid_i = 0;
var pid_kp = -0.003;
var pid_ki = -0.02;
var pid_kd = -0.0005;
function toInt(f) {
  return Math.round(f);
}
function tick(diff) {
  var weight = 0.75;
  currentSpeed = (currentSpeed * (1-weight)) + diff*weight;
  currentSpeedRpm = speedQdToRpm(currentSpeed);

  // PID
  if (pidEnabled) {
    var error = currentSpeedRpm - targetSpeedRpm;
    // P=current error
    var pid_p = error;
    // I=accumulative
    pid_i += error * (tickTimeInMS/1000.0);
    // D=derrivitive
    var pid_d = (error - pid_lastError)*(1000.0/tickTimeInMS);
    pid_lastError = error;
    
    var output = pid_kp*pid_p + pid_ki*pid_i + pid_kd*pid_d;
    console.log('speed=' + toInt(currentSpeedRpm) + ', p='+toInt(pid_p) + ', i=' + toInt(pid_i) + ', d=' + toInt(pid_d) + ', out=' + toInt(pid_kp*pid_p) +'+'+ toInt(pid_ki*pid_i)+'+'+ toInt(pid_kd*pid_d) + '=' + toInt(output));
    if (output < -100) {
      output = -100;
    } else if (output > 100) {
      output = 100;
    }
    currentPowerPct = output;
    setPorweInternal(output);
  }
}

var v = posMonitor.update().getValue();
console.log('' + v + ', pos=' + pos);
function timeout() {
  var newVal = posMonitor.update().getValue();
  var diff = 0;
  if (newVal != v) {
    diff = newVal - v;
    v = newVal;
    if (diff < - 128) {
      diff += 256;
    } else if (diff > 128) {
      diff -= 256;
    }
    pos += diff;
    console.log(''+v + ', d='+diff + ', pos=' + pos);
  }
  tick(diff);
  setTimeout(timeout, tickTimeInMS);
}

setTimeout(timeout, tickTimeInMS);

// return speed is RPM
function motorGetSpeed() {
  return currentSpeedRpm;
}

function motorGetStatus() {
  return {
    speedRpm: Math.round(currentSpeedRpm),
    powerPct: Math.round(currentPowerPct*10)/10.0,
  }
}

function motorTurnOnPid(targetSpeedRpm_) {
  pidEnabled = true;
  pid_i = 0;

  targetSpeedRpm = targetSpeedRpm_;
  pid_lastError = currentSpeedRpm - targetSpeedRpm;
  // currentPowerPct = targetSpeedRpm/100;
  // setPorweInternal(currentPowerPct);
}
function motorTurnOffPid() {
  pidEnabled = false;
  motorSetPower(0);
}

module.exports = {
  motorSetPower: motorSetPower,
  motorGetPower: motorGetPower,
  motorGetPosition: motorGetPosition,
  motorGetSpeed: motorGetSpeed,
  motorGetStatus: motorGetStatus,
  motorTurnOnPid: motorTurnOnPid,
  motorTurnOffPid: motorTurnOffPid,
};
