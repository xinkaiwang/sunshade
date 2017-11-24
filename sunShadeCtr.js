'use strict'

var promisify = require('bluebird').promisify;
var button = require('perf-gpio').button;
var config = require('./config');
var button = require('perf-gpio').button;
var onoff  = require('perf-gpio').onoff;

var upLed = onoff(config.upLed).set;
var downLed = onoff(config.downLed).set;

upLed(1);
downLed(1);

function init(initCb) {
    var sunShadeDev = null;

    var forwardButton = button(config.forwardButton, 'PUD_UP');
    var midButton = button(config.midButton, 'PUD_UP');
    var backwardButton = button(config.backwardButton, 'PUD_UP');

    var modeEnum = {
        NUTRUAL: 0,
        FORWARD: 1,
        BACKWARD: 2,
        SETLIMIT: 3,
        FAST_FORWARD: 4,
        FAST_BACKWARD: 5,
    };

    var currentMode = modeEnum.NUTRUAL;
    function setMotor(val) {
        upLed(val>0 ? 1 : 0);
        downLed(val<0 ? 1 : 0);
        sunShadeDev.setMotor(val);
    }

    function fastForward() {
        console.log('FAST_FORWARD');
        var pos = sunShadeDev.getCurrentPos();
        if (pos < sunShadeDev.getTopLimit()) {
            setMotor(1);
            currentMode = modeEnum.FAST_FORWARD;
        }
    }

    function fastBackward() {
        console.log('FAST_BACKWARD');
        var pos = sunShadeDev.getCurrentPos();
        if (pos > sunShadeDev.getButtomLimit()) {
            setMotor(-1);
            currentMode = modeEnum.FAST_BACKWARD;
        }
    }

    function getBinaryState() {
        var top = sunShadeDev.getTopLimit();
        var buttom = sunShadeDev.getButtomLimit();
        var middle = (top + buttom)/2;
        var binState = sunShadeDev.getCurrentPos() > middle;
        console.log('getBinaryState() binState=' + binState);
        return binState;
    }

    var lastForwardTimeMs = 0;
    forwardButton.watch(function(err, buttonStatus) {
        console.log(buttonStatus? "true":"false");
        if (currentMode == modeEnum.NUTRUAL) {
            if (!buttonStatus) { // button pressed
                var now = Date.now();
                var elapsedSinceLastClick = now - lastForwardTimeMs;
                if (elapsedSinceLastClick > 100 && elapsedSinceLastClick < 500) {
                    fastForward();
                } else {
                    setMotor(1);
                    lastForwardTimeMs = now;
                    currentMode = modeEnum.FORWARD;
                }
            }
        } else if (currentMode == modeEnum.FORWARD) {
            if (buttonStatus) { // button released
                setMotor(0);
                currentMode = modeEnum.NUTRUAL;
            }
        } else if (currentMode == modeEnum.SETLIMIT) {
            if (!buttonStatus) { // button pressed
                sunShadeDev.setTopLimit(sunShadeDev.getCurrentPos());
                currentMode = modeEnum.NUTRUAL;
            }
        } else if (currentMode == modeEnum.FAST_BACKWARD) {
            if (!buttonStatus) { // button pressed
                setMotor(0);
                currentMode = modeEnum.NUTRUAL;
            }
        }
    });

    var lastBackwardTimeMs = 0;
    backwardButton.watch(function(err, buttonStatus) {
        console.log(buttonStatus? "true":"false");
        if (currentMode == modeEnum.NUTRUAL) {
            if (!buttonStatus) { // button pressed
                var now = Date.now();
                var elapsedSinceLastClick = now - lastBackwardTimeMs;
                if (elapsedSinceLastClick > 100 && elapsedSinceLastClick < 500) {
                    fastBackward();
                } else {
                    setMotor(-1);
                    lastBackwardTimeMs = now;
                    currentMode = modeEnum.BACKWARD;
                }
            }
        } else if (currentMode == modeEnum.BACKWARD) {
            if (buttonStatus) { // button released
                setMotor(0);
                currentMode = modeEnum.NUTRUAL;
            }
        } else if (currentMode == modeEnum.SETLIMIT) {
            if (!buttonStatus) { // button pressed
                sunShadeDev.setButtomLimit(sunShadeDev.getCurrentPos());
                currentMode = modeEnum.NUTRUAL;
            }
        }  else if (currentMode == modeEnum.FAST_FORWARD) {
            if (!buttonStatus) { // button pressed
                setMotor(0);
                currentMode = modeEnum.NUTRUAL;
            }
        }
    });

    midButton.watch(function(err, buttonStatus) {
        console.log(buttonStatus? "true":"false");
        if (currentMode == modeEnum.NUTRUAL) {
            if (!buttonStatus) { // button pressed
                currentMode = modeEnum.SETLIMIT;
            }
        } else if (currentMode == modeEnum.SETLIMIT) {
            if (buttonStatus) { // button released
                currentMode = modeEnum.NUTRUAL;
            }
        }
    });


    var currentPos = 0;
    function timeout() {
        var newPos = sunShadeDev.getCurrentPos();
        if (newPos != currentPos) {
            console.log(newPos);
            currentPos = newPos;
            if (currentMode == modeEnum.FAST_FORWARD) {
                if (newPos >= sunShadeDev.getTopLimit()) {
                    setMotor(0);
                    currentMode = modeEnum.NUTRUAL;
                }
            } else if (currentMode == modeEnum.FAST_BACKWARD) {
                if (newPos <= sunShadeDev.getButtomLimit()) {
                    setMotor(0);
                    currentMode = modeEnum.NUTRUAL;
                }
            }
        }
    }

    promisify(require('./sunShadeDev'))()
    .then(function(dev) {
        sunShadeDev = dev;
    }).then(function() {
        setMotor(0.5);
    }).delay(100).then(function() {
        setMotor(0);
    }).delay(200).then(function() {
        setMotor(-0.5);
    }).delay(100).then(function() {
        setMotor(0);
        upLed(0);
        downLed(0);
        setInterval(timeout, 100);
        var ret = {
            ff: fastForward,
            fb: fastBackward,
            getBinaryState: getBinaryState
        };
        initCb(null, ret);
    }).error(function(err) {
        console.log(err);
        upLed(0);
        downLed(0);
        initCb(err);
    });

}

module.exports = init;