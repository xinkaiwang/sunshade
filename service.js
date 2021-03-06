'use strict'

var _ = require('underscore');
var express = require('express');
var app = express();

var Promise = require('bluebird');
var promisify = require('bluebird').promisify;
var readThermo = promisify(require('./thermo').read);
var registerSession = promisify(require('./robotShadeClient').registerSession);
var reportAction = promisify(require('./robotShadeClient').reportAction);
var heartbeat = promisify(require('./robotShadeClient').heartbeat);

var heartbeatDelay = 10 * 60 * 1000; // 10 min

var sunShadeCtr = null;
var macAddr;
var boardId;
var shadeProfileId;
var localIpAddr = require('./localIpAddr');
var temperature;
var shadeSessionId;

function reportActionToServer(action, source) {
    if (shadeSessionId) {
        var opt = {
            sessionId: shadeSessionId,
            action: action,
            source: source,
            temperature: temperature
        };
        reportAction(opt).then(function() {
            console.log('reportAction() done');
        }).error(function(err) {
            console.error('reportAction() fail err=' + err);
        })
    }
}

function doHeartbeat() {
    readThermo()
    .then(function(result) {
        // result = { id: '28-0516a72226ff', temperature: 26.4 }
        temperature = result.temperature;
        var opt = {
            sessionId: shadeSessionId,
            now: (new Date()).toISOString(),
            temperature: temperature
        };
        return heartbeat(opt);
    })
    .then(function(response) {
        console.log('heartbeat() done, t=' + temperature + ' response=' + JSON.stringify(response));
        if (response.cmd) {
            console.log('cmd = ' + response.cmd)
            if (response.cmd === 'on') {
                console.log('hb::on');
                if (sunShadeCtr) {
                    sunShadeCtr.ff();
                }
            } else if (response.cmd === 'off') {
                console.log('hb::off');
                if (sunShadeCtr) {
                    sunShadeCtr.fb();
                }
            }
        }
    })
    .error(function(err) {
        console.error(err);
    });

}

function onTimeout() {
    setTimeout(onTimeout, heartbeatDelay);
    doHeartbeat();
}

var list = [promisify(require('./sunShadeCtr'))(), readThermo(), promisify(require('getmac').getMac)()];
Promise.all(list)
    .then(function(resultList) {
        // resultList[0]: sunShadeCtr
        sunShadeCtr = resultList[0];

        var wemore = require('wemore');
        var ip = require('./localIpAddr');
        var weMoName = 'SunShade' + _.last(ip.split('.'));
        var weMoPort = 9002;
        var binaryState = sunShadeCtr.getBinaryState();


        // resultList[2]: macAddr
        console.log('macAddr=' + resultList[2]);
        macAddr = resultList[2];
        var weMoId = resultList[2].replace(/:/g,'');
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
            reportActionToServer('on', 'wemo');
            if (sunShadeCtr) {
                sunShadeCtr.ff();
            }
        });

        we.on('off', function() {
            console.log("wemore::off");
            reportActionToServer('off', 'wemo');
            if (sunShadeCtr) {
                sunShadeCtr.fb();
            }
        });

        // resultList[1] = { id: '28-0516a72226ff', temperature: 26.4 }
        temperature = resultList[1].temperature;
        console.log('boardId=' + resultList[1].id);
        boardId = resultList[1].id;
        shadeProfileId = sunShadeCtr.getShadeProfileId();
        console.log('profileId=' + shadeProfileId);
        console.log('localIpAddr=' + localIpAddr);
        var opt = {
            profileId: shadeProfileId,
            macAddr: macAddr,
            boardId: boardId,
            localIpAddr: localIpAddr
        };
        return registerSession(opt);
    })
    .then(function(result) {
        // result = {"session":18,"profile":20001}
        if (result.profile && shadeProfileId !== result.profile) {
            // profileId updated?!
            console.log('profileId old=' + shadeProfileId + ' new=' + result.profile);
            sunShadeCtr.setShadeProfileId(result.profile);
            shadeProfileId = result.profile;
        }
        shadeSessionId = result.session;
        console.log('shadeSessionId=' + shadeSessionId);
        onTimeout();
    })
    .error(function(err) {
        console.error('error happend when trying to registerSession: ' + err);
    });


// curl http://localhost:8080/switch1/on
app.get('/switch1/on', function (req, rsp) {
    console.log('http::on');
    reportActionToServer('on', 'http');
    if (sunShadeCtr) {
        sunShadeCtr.ff();
    }
    rsp.send('Hello World!');
});

// curl http://localhost:8080/switch1/off
app.get('/switch1/off', function (req, rsp) {
    console.log('http::off');
    reportActionToServer('off', 'http');
    if (sunShadeCtr) {
        sunShadeCtr.fb();
    }
    rsp.send('Hello World!');
});

app.listen(8080, function() {
    console.log('app listening on port 8080!');
});

