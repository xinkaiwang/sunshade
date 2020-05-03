'use strict'

var promisify = require('bluebird').promisify;
var button = require('perf-gpio').button;
var config = require('./config');
var onoff  = require('perf-gpio').onoff;
var motorCmd = require('./motorCmd');
var mysqlStore = require('./mysqlStore');

var upLedObj = onoff(config.upLed);
var downLedObj = onoff(config.downLed);

var upLed = upLedObj.set;
var downLed = downLedObj.set;

upLed(1);
downLed(1);

process.on('cleanup', function() {upLedObj.release(); downLedObj.release();});

// var sunShadeDev = null;

function dedupedButton(rawButton) {
  function get() {
    return rawButton.get();
  }
  function watch(cb) {
    var stat = rawButton.get();
    function timeout() {
      var newStat = rawButton.get();
      if (newStat != stat) {
        stat = newStat;
        cb(null, stat);
      }
      setTimeout(timeout, 10);
    }
    timeout();
  }
  return {
    get: get,
    watch: watch,
  }
}

var forwardButton = dedupedButton(button(config.forwardButton, 'PUD_UP'));
var midButton = dedupedButton(button(config.midButton, 'PUD_UP'));
var backwardButton = dedupedButton(button(config.backwardButton, 'PUD_UP'));

var modeEnum = {
    NUTRUAL: 0,
    FORWARD: 1,
    BACKWARD: 2,
    SETLIMIT: 3,
    // FAST_FORWARD: 4,
    // FAST_BACKWARD: 5,
};

var currentMode = modeEnum.NUTRUAL;
function setMotorByPower(pct) { // -100 <= pct <= 100
  upLed(pct>0 ? 1 : 0);
  downLed(pct<0 ? 1 : 0);
  motorCmd.motorSetPower(pct);
}
var targetSpeedRpm = config.motorTargetSpeedRpm;
function setMotorBySpeed(rpm) { // -10000? <= rpm <= 10000?
  upLed(rpm>0 ? 1 : 0);
  downLed(rpm<0 ? 1 : 0);
  motorCmd.motorPidSpeedOn(rpm);
}
function setMotorOff() {
  motorCmd.motorPidSpeedOff();
}

var currentPos = 0;
var topLimit = 0;
var bottomLimit = 0;

function loadStoredLimitPos() {
  return promisify(mysqlStore.getAll)()
  .then(function (data) {
    currentPos = data.currentPos;
    topLimit = data.topLimit;
    if (typeof topLimit == 'undefined') {
      topLimit = currentPos + 100;
    }
    bottomLimit = data.bottomLimit;
    if (typeof bottomLimit == 'undefined') {
      bottomLimit = currentPos - 100;
    }
    console.log('currentPos=' + currentPos + ', topLimit=' + topLimit + ', bottomLimit' + bottomLimit);
    return currentPos;
  });
}

function syncTopLimitToMysql(newTopLimit) {
  return promisify(mysqlStore.set)({topLimit: newTopLimit}).then(function() {
    console.log('syncTopLimitToMysql(): topLimit='+ newTopLimit);
  }).catch(function(err) {
    console.log('syncTopLimitToMysql(): failed err='+ err);
  });
}

function syncBottomLimitToMysql(newbottomLimit) {
  promisify(mysqlStore.set)({bottomLimit: newbottomLimit}).then(function() {
    console.log('syncbottomLimitToMysql(): bottomLimit='+ newbottomLimit);
  }).catch(function(err) {
    console.log('syncbottomLimitToMysql(): failed err='+ err);
  });
}

function fastUpward() {
  // console.log('FAST_UPWARD');
  motorCmd.motorMoveToPosSe(topLimit, targetSpeedRpm).then(function() {
    console.log('FAST_UPWARD api call completed');
  });
}

function fastDownward() {
  // console.log('FAST_DOWNWARD');
  motorCmd.motorMoveToPosSe(bottomLimit, -targetSpeedRpm).then(function() {
    console.log('FAST_DOWNWARD api call completed');
  });
}

// function getBinaryState() {
//     var top = sunShadeDev.getTopLimit();
//     var buttom = sunShadeDev.getbottomLimit();
//     var middle = (top + buttom)/2;
//     var binState = sunShadeDev.getCurrentPos() > middle;
//     console.log('getBinaryState() binState=' + binState);
//     return binState;
// }

var lastForwardTimeMs = 0;
forwardButton.watch(function(err, buttonStatus) {
    // console.log(buttonStatus? "true":"false");
    if (currentMode == modeEnum.NUTRUAL) {
        if (!buttonStatus) { // button pressed
          var now = Date.now();
          var elapsedSinceLastClick = now - lastForwardTimeMs;
          if (elapsedSinceLastClick > 100 && elapsedSinceLastClick < 500) {
            // fast-forward mode
            console.log('fast-forward mode, target=' + topLimit);
            fastUpward();
          } else {
            lastForwardTimeMs = now;
            currentMode = modeEnum.FORWARD;
            console.log('forward button pressed');
            setMotorBySpeed(targetSpeedRpm);
          }
        }
    } else if(currentMode == modeEnum.FORWARD) {
      if (buttonStatus) { // button released
        currentMode = modeEnum.NUTRUAL;
        console.log('forward button relesed');
        setMotorOff();
      }
    } else if(currentMode == modeEnum.SETLIMIT) {
      if (!buttonStatus) { // button pressed
        currentMode = modeEnum.NUTRUAL;
        // console.log('set limit...');
        motorCmd.motorGetPos().then(function(pos) {
          console.log('set limit Done. upLimit='+pos);
          topLimit = pos;
          syncTopLimitToMysql(topLimit);
        });
      }
    }
});

var lastBackwardTimeMs = 0;
backwardButton.watch(function(err, buttonStatus) {
  // console.log(buttonStatus? "true":"false");
  if (currentMode == modeEnum.NUTRUAL) {
    if (!buttonStatus) { // button pressed
      var now = Date.now();
      var elapsedSinceLastClick = now - lastBackwardTimeMs;
      if (elapsedSinceLastClick > 100 && elapsedSinceLastClick < 500) {
        // fast-backward mode
        console.log('fast-backward mode, target=' + bottomLimit);
        fastDownward();
      } else {
        lastBackwardTimeMs = now;
        currentMode = modeEnum.BACKWARD;
        console.log('backward button pressed');
        setMotorBySpeed(-targetSpeedRpm);
      }
    }
  } else if(currentMode == modeEnum.BACKWARD) {
    if (buttonStatus) { // button released
      currentMode = modeEnum.NUTRUAL;
      console.log('backward button relesed');
      setMotorOff();
    }
  } else if(currentMode == modeEnum.SETLIMIT) {
    if (!buttonStatus) { // button pressed
      currentMode = modeEnum.NUTRUAL;
      // console.log('set limit...');
      motorCmd.motorGetPos().then(function(pos) {
        console.log('set limit Done. downLimit='+pos);
        bottomLimit = pos;
        syncBottomLimitToMysql(bottomLimit);
      });
    }
  }
});

midButton.watch(function(err, buttonStatus) {
  // console.log(buttonStatus? "true":"false");
  if (currentMode == modeEnum.NUTRUAL) {
    if (!buttonStatus) { // button pressed
      currentMode = modeEnum.SETLIMIT;
      console.log('mid button pressed');
    }
  } else if(currentMode == modeEnum.SETLIMIT) {
    if (buttonStatus) { // button released
      currentMode = modeEnum.NUTRUAL;
      console.log('mid button relesed');
    }
  }
});

function syncCurrentPos() {
  return promisify(mysqlStore.getAll)()
  .then(function (data) {
    if (currentPos != data.currentPos) {
      currentPos = data.currentPos;
      console.log('currentPos=' + currentPos);
    }
    return currentPos;
  });
}

function timeout() {
  return syncCurrentPos().finally(function() {
    setTimeout(timeout, 1000);
  });
}

// return true/false (shade_up=on=true, shade_down=off=false)
function getOnOffState() {
  var sum = parseFloat(bottomLimit) + parseFloat(topLimit);
  var middle = (bottomLimit + topLimit) / 2;
  var binaryState = currentPos > middle;
  return binaryState;
}

var initFinished = loadStoredLimitPos()
  .then(motorCmd.motorShake)
  .then(timeout)
  .then(function() {
    console.log('sunshadeMgr::initFinished()');
  });

function waitForInitFinish() {
  return initFinished.then(function() {return 'ok';});
}

module.exports = {
  waitForInitFinish: waitForInitFinish,
  fastUpward: fastUpward,
  fastDownward: fastDownward,
  getOnOffState: getOnOffState,
}
