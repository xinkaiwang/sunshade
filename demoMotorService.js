#!/usr/bin/env node
'use strict'

var Promise = require('bluebird').Promise;
var motor = require('./motorCmd');

// motorPidSpeedOn(4000).then(function (ret) { console.log(ret); });

// motorGetCurrentSpeed()
//   .then(function(powerPct) {console.log("speed="+powerPct);});

// motorSetPower(0).then(console.log);
// motorGetPower()
//   .then(function(powerPct) {console.log("power="+powerPct);});
// motorGetPos().then(console.log);
// motorPidSpeedOn(100).then(console.log);
// motorMoveTo(2000).then(console.log);


// test case: motorMoveToPosSe can be interrupted by another motorMoveToPos
// var targetPos = 0;
// motor.motorGetPos().then(function(pos) {
//   targetPos = pos + 200;
//   console.log('currentPos='+pos +', targetPos=' + targetPos);
//   return motor.motorMoveToPosSe(targetPos, 4000);
// }).then(console.log);

// function timeout() {
//   motor.motorGetCurrentStatus()
//   .then(function(status) {console.log("status="+status);});
//   setTimeout(timeout, 300);
// }
// timeout();

// setTimeout(function() {
//   // motorPidSpeedOn(6000);
//   motor.motorMoveToPos(targetPos+100, 6000);
// }, 3*1000);

// setTimeout(function(){
//   motor.motorSetPower(0).then(function (ret) { 
//     console.log(ret); 
//     process.exit(0);
//   });
// }, 8*1000);


// test case move forward/move back to pos
var originPos = 0;
var targetPos = 0;
motor.motorGetPos().then(function(pos) {
  originPos = pos;
  targetPos = pos + 200;
  console.log('currentPos='+pos +', targetPos=' + targetPos);
  motor.motorMoveToPosSe(targetPos, 2000);
  return Promise.delay(15*1000);
}).then(function() {
  motor.motorMoveToPosSe(originPos, -6000);
  return Promise.delay(6*1000);
}).then(process.exit);

function timeout() {
  motor.motorGetCurrentStatus()
  .then(function(status) {console.log("status="+status);});
  setTimeout(timeout, 300);
}
timeout();
