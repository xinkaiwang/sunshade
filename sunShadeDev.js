'use strict'

var promisify = require('bluebird').promisify;
var config = require('./config');

var qd = require('perf-gpio').quadrature_decoder;
// https://pinout.xyz/pinout/wiringpi#
var qdCounter = qd(config.qdPinA, config.qdPinB);

var motor = require('perf-gpio').motor();

var m = motor(config.motorPinA, config.motorPinB);

function cleanup() {
    m(0);
    motor.shutdown();
}
function exitHandler(options, err) {
    if (options.cleanup) {
        m(0);
        motor.shutdown();
    }
    if (err) {
        console.log(err.stack);
    }
    if (options.exit) {
        process.exit();
    }
}

process.on('cleanup', cleanup);
// do app specific cleaning before exiting
process.on('exit', function () {
    process.emit('cleanup');
});

// catch ctrl+c event and exit normally
process.on('SIGINT', function () {
    console.log('Ctrl-C...');
    process.exit(2);
});

//catch uncaught exceptions, trace, then exit normally
process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
});

var startQdPos = qdCounter.getCounter();
console.log('startQdPos=' + startQdPos);
var currentQdPos = startQdPos;
var initComplete = false;
var startStorePos = 0;
var currentStorePos = 0;
var topLimit = 0;
var buttomLimit = 0;

var store = require('./mysqlStore');

function getCurrentPos() {
    return currentStorePos;
}

var motorValue = 0;
function setMotor(val) {
    motorValue = val;
    m(val);
}
function getMotor() {
    return motorValue;
}
function setTopLimit(val) {
    console.log('setTopLimit=' + val);
    topLimit = val;
    return promisify(store.set)({topLimit: val});
}

function getTopLimit() {
    return topLimit;
}

function setButtomLimit(val) {
    console.log('setButtomLimit=' + val);
    buttomLimit = val;
    return promisify(store.set)({buttomLimit: val});
}

function getButtomLimit() {
    return buttomLimit;
}

function onTimeout() {
    var needSave = false;
    var newQdPos = qdCounter.getCounter();
    if (newQdPos != currentQdPos) {
        if (initComplete) {
            var distance = newQdPos - startQdPos;
            var newStorePos = startStorePos + distance;
            if (currentStorePos != newStorePos) {
                needSave = true;
                currentStorePos = newStorePos;
                // console.log('newStorePos='+newStorePos);
                promisify(store.set)({currentPos: newStorePos})
                    .then(function(){
                        setTimeout(onTimeout, 100);
                    }).error(function(err) {
                        console.log(err);
                        setTimeout(onTimeout, 100);
                    });
            }
        }
    }
    if (!needSave) {
        setTimeout(onTimeout, 100);
    }
}

setTimeout(onTimeout, 100);

function init(cbInit) {
    promisify(store.getAll)()
      .then(function(status) {
        if (!status || !('currentPos' in status)) {
            status = status || {};
            status.currentPos = 0;
            return promisify(store.set)(status).then(function() {
                return status;
            });
        } else {
            return status;
        }
      }).then(function(status) {
        startStorePos = status.currentPos;
        currentStorePos = startStorePos;
        topLimit = status.topLimit? status.topLimit : 0;
        buttomLimit = status.buttomLimit ? status.buttomLimit : 0;
        console.log(JSON.stringify(status));
        initComplete = true;
      }).then(function() {
        cbInit(null, {
            getCurrentPos: getCurrentPos,
            setMotor: setMotor,
            getMotor: getMotor,
            setTopLimit: setTopLimit,
            getTopLimit: getTopLimit,
            setButtomLimit: setButtomLimit,
            getButtomLimit: getButtomLimit
        });
      }).error(function(err) {
        cbInit(err);
      });
}

module.exports = init;