#!/usr/bin/env node

'use strict'

var _ = require('underscore');
var Promise = require('bluebird');
var promisify = require('bluebird').promisify;
var wemore = require('wemore');
var express = require('express');
var app = express();

var sunshadeMgr = require('./sunshadeMgr');
var readThermo = promisify(require('./thermo').read);
var getMacAddress = promisify(require('getmac').getMac);

// curl http://localhost:8181/api/v1/move/top
app.get('/api/v1/move/top', function (req, rsp) {
  console.log('move/top');
  sunshadeMgr.fastUpward();
  rsp.send('ok');
});

// curl http://localhost:8181/api/v1/move/bottom
app.get('/api/v1/move/bottom', function (req, rsp) {
  console.log('move/bottom');
  sunshadeMgr.fastDownward();
  rsp.send('ok');
});

app.listen(8181, function() {
  console.log('app listening on port 8181!');
});

var macAddr;
var list = [sunshadeMgr.waitForInitFinish(), readThermo(), getMacAddress()];
Promise.all(list)
    .then(function(resultList) {
      console.log(resultList);
      // resultList[0]: sunShadeCtr
      // sunShadeCtr = resultList[0];

      var ip = require('./localIpAddr');
      var weMoName = 'SunShade' + _.last(ip.split('.'));
      var weMoPort = 9002;
      var binaryState = sunshadeMgr.getOnOffState();

      // resultList[2]: macAddr
      console.log('macAddr=' + resultList[2]);
      macAddr = resultList[2];
      var weMoId = macAddr.replace(/:/g,'');
      while (weMoId.length < 14) {
          weMoId = '0' + weMoId;
      }

      var we = wemore.Emulate({friendlyName: weMoName, port: weMoPort, serial: weMoId, binaryState: binaryState});
      console.log('weMo started, friendlyName='+weMoName+' port=' + weMoPort, ' serial=' + weMoId, ' binaryState=' + binaryState);

      we.on('listening', function() {
          // if you want it, you can get it:
          console.log("Wemore listening on", this.port);
      });

      // also, 'on' and 'off' events corresponding to binary state
      we.on('on', function() {
          console.log("wemore::on");
          // reportActionToServer('on', 'wemo');
          if (sunshadeMgr) {
            sunshadeMgr.fastUpward();
          }
      });

      we.on('off', function() {
          console.log("wemore::off");
          // reportActionToServer('off', 'wemo');
          if (sunshadeMgr) {
            sunshadeMgr.fastDownward();
          }
      });
    });
