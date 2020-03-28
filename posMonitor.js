'use strict';

var inputBank = require('perf-gpio').inputBank();
var clockOut = require('perf-gpio').clockOut();
var config = require('./config');


function init() {
  
  var pinBank = inputBank(config.qdRegBank, 'PUD_DOWN');
  var clock = clockOut(config.galClockOut);
  clock.setFeq(100000); // 10k Hz

  var monitor = {};

  function readValueFromPinBank() {
    var v1 = 0;
    do {
      v1 = pinBank();
      var v2 = pinBank();
    } while (v1 != v2);
    return v1;
  }
  var value = readValueFromPinBank();
  function getValue() {
    return value;
  }
  function update() {
    value = readValueFromPinBank();
    return monitor;
  }
  monitor.getValue = getValue;
  monitor.update = update;
  return monitor;
}

module.exports = init;