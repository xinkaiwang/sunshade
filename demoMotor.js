'use strict'

var motor = require('perf-gpio').motor();
var config = require('./config');

var mp = motor(config.motorPinA, config.motorPinB);

mp(-0.5);
setTimeout(motor.shutdown, 5000);
