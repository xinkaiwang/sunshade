'use strict'

var device = require('./motorDevice');
var promisify = require('bluebird').promisify;

var moveToPos_running = null;
function abortExistMoveToPosRun() {
  if (moveToPos_running) {
    if (moveToPos_running.aborted || moveToPos_running.finished) {
      moveToPos_running = null;
    } else {
      moveToPos_running.needAbort = true;
      moveToPos_running = null;
    }
  }
}

var runIdSeq = 1;

var targetPos = 0;
var startPos = 0;
function moveToPosFunc(newPos, speedRpm, stopAtEnd, cb) {
  startPos = device.motorGetPosition();
  targetPos = newPos;
  device.motorTurnOnPid(speedRpm);
  abortExistMoveToPosRun();
  var thisInstance = {
    runId: runIdSeq++,
    needAbort: false,
    aborted: false,
    finished: false,
  };
  moveToPos_running = thisInstance;
  console.log('moveToPos(): currentPos='+Math.round(device.motorGetPosition()) + ', targetPos='+ targetPos + ', runId=' + thisInstance.runId);

  function daemon() {
    if (thisInstance.needAbort) {
      thisInstance.aborted = true;
      cb('moveToPos(): aborted, runId='+thisInstance.runId);
      return;
    }
    var currentPos = device.motorGetPosition();
    // console.log('moveToPos(): currentPos='+currentPos + ', targetPos='+ targetPos);
    if ((speedRpm > 0 && currentPos >= targetPos) ||
        (speedRpm < 0 && currentPos <= targetPos)) {
      if (stopAtEnd) {
        device.motorTurnOffPid();
      }
      thisInstance.finished = true;
      cb(null, 'moveToPos():done, runId='+thisInstance.runId);
    } else {
      setTimeout(daemon, 50);
    }
  }

  daemon();
}

var moveToPos = promisify(moveToPosFunc);

var moveToPosSe_running = false;
var softStartDistance = 50;
var softEndDistance = 50;
var softRatio = 0.5;
function moveToPosWithSoftStartEnd(targetPos, speedRpm, cb) {
  var startPos = device.motorGetPosition();
  var direction = targetPos > startPos ? 1 : -1;
  var softStartFinishPos = startPos;
  var softEndStartPos = startPos;
  if (direction > 0) {
    softStartFinishPos = Math.min(startPos + softStartDistance, targetPos);
    softEndStartPos = Math.max(targetPos - softEndDistance, startPos);
  }
  // console.log('startPos='+startPos + ', softStartFinishPos='+softStartFinishPos + ', softEndStartPos=' + softEndStartPos + ', targetPos=' + targetPos);
  moveToPosSe_running = true;
  // step 1: soft start 
  moveToPos(softStartFinishPos, speedRpm*softRatio, false)
    .catch(function(err) {
      console.log('moveToPosSe(): stage1 failed, err='+err);
      moveToPosSe_running = false;
    }).then(function() {
      console.log('moveToPosSe(): stage1 done');
      if (!moveToPosSe_running) {
        return 'aborted';
      }
      return moveToPos(softEndStartPos, speedRpm, false).catch(function(err) {
        console.log('moveToPosSe(): stage2 failed, err='+err);
        moveToPosSe_running = false;
      });
    }).then(function() {
      console.log('moveToPosSe(): stage2 done');
      if (!moveToPosSe_running) {
        return 'aborted';
      }
      return moveToPos(targetPos, speedRpm*softRatio, true).catch(function(err) {
        console.log('moveToPosSe(): stage3 failed, err='+err);
        moveToPosSe_running = false;
      });
    }).then(function() {
      moveToPosSe_running = false;
      console.log('moveToPosSe(): stage3 done');
    }).catch(console.err);

}

function abortAll() {
  moveToPosSe_running = false;
  abortExistMoveToPosRun();
}

module.exports = {
  moveToPos: moveToPos,
  moveToPosWithSoftStartEnd: promisify(moveToPosWithSoftStartEnd),
  abortAll: abortAll,
};