'use strict'

var promisify = require('bluebird').promisify;
var button = require('perf-gpio').button;

function init(initCb) {
    var sunShadeDev = null;

    var forwardButton = button(3, 'PUD_UP');
    var midButton = button(22, 'PUD_UP');
    var backwardButton = button(26, 'PUD_UP');

    var modeEnum = {
        NUTRUAL: 0,
        FORWARD: 1,
        BACKWARD: 2,
        SETLIMIT: 3,
        FAST_FORWARD: 4,
        FAST_BACKWARD: 5,
    };

    var currentMode = modeEnum.NUTRUAL;

    function fastForward() {
        console.log('FAST_FORWARD');
        sunShadeDev.setMotor(1);
        currentMode = modeEnum.FAST_FORWARD;
    }

    function fastBackward() {
        console.log('FAST_BACKWARD');
        sunShadeDev.setMotor(-1);
        currentMode = modeEnum.FAST_BACKWARD;
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
                    sunShadeDev.setMotor(1);
                    lastForwardTimeMs = now;
                    currentMode = modeEnum.FORWARD;
                }
            }
        } else if (currentMode == modeEnum.FORWARD) {
            if (buttonStatus) { // button released
                sunShadeDev.setMotor(0);
                currentMode = modeEnum.NUTRUAL;
            }
        } else if (currentMode == modeEnum.SETLIMIT) {
            if (!buttonStatus) { // button pressed
                sunShadeDev.setTopLimit(sunShadeDev.getCurrentPos());
                currentMode = modeEnum.NUTRUAL;
            }
        } else if (currentMode == modeEnum.FAST_BACKWARD) {
            if (!buttonStatus) { // button pressed
                sunShadeDev.setMotor(0);
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
                    sunShadeDev.setMotor(-1);
                    lastBackwardTimeMs = now;
                    currentMode = modeEnum.BACKWARD;
                }
            }
        } else if (currentMode == modeEnum.BACKWARD) {
            if (buttonStatus) { // button released
                sunShadeDev.setMotor(0);
                currentMode = modeEnum.NUTRUAL;
            }
        } else if (currentMode == modeEnum.SETLIMIT) {
            if (!buttonStatus) { // button pressed
                sunShadeDev.setButtomLimit(sunShadeDev.getCurrentPos());
                currentMode = modeEnum.NUTRUAL;
            }
        }  else if (currentMode == modeEnum.FAST_FORWARD) {
            if (!buttonStatus) { // button pressed
                sunShadeDev.setMotor(0);
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
                    sunShadeDev.setMotor(0);
                    currentMode = modeEnum.NUTRUAL;
                }
            } else if (currentMode == modeEnum.FAST_BACKWARD) {
                if (newPos <= sunShadeDev.getButtomLimit()) {
                    sunShadeDev.setMotor(0);
                    currentMode = modeEnum.NUTRUAL;
                }
            }
        }
    }

    promisify(require('./sunShadeDev'))()
    .then(function(dev) {
        sunShadeDev = dev;
    }).then(function() {
        // sunShadeDev.setMotor(-1);
        setInterval(timeout, 100);
        var ret = {
            ff: fastForward,
            fb: fastBackward
        };
        initCb(null, ret);
    }).error(function(err) {
        console.log(err);
        initCb(err);
    });

}

module.exports = promisify(init);