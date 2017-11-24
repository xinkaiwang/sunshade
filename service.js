'use strict'

var _ = require('underscore');
var express = require('express');
var app = express();

var sunShadeCtr = null;
require('./sunShadeCtr')(function (err, ss) {
    sunShadeCtr = ss;
});

var wemore = require('wemore');
var ip = require('./localIpAddr');
var weMoName = 'Gate' + _.last(ip.split('.'));
var weMoPort = 9002;
require('getmac').getMac(function(err, macAddress) {
    if (err)  throw err;
    console.log(macAddress);
    var weMoId = macAddress.replace(/:/g,'');
    while (weMoId.length < 14) {
        weMoId = '0' + weMoId;
    }

    var we = wemore.Emulate({friendlyName: weMoName, port: weMoPort, serial: weMoId});
    console.log('weMo started, friendlyName='+weMoName+' port=' + weMoPort, ' serial=' + weMoId);

    we.on('listening', function() {
        // if you want it, you can get it:
        console.log("Wemore listening on", this.port);
    });

    // also, 'on' and 'off' events corresponding to binary state
    we.on('on', function() {
        console.log("wemore::on");
        if (sunShadeCtr) {
            sunShadeCtr.ff();
        }
    });

    we.on('off', function() {
        console.log("wemore::off");
        if (sunShadeCtr) {
            sunShadeCtr.fb();
        }
    });
});

// curl http://localhost:8080/switch1/on
app.get('/switch1/on', function (req, rsp) {
    console.log('http::on');
    if (sunShadeCtr) {
        sunShadeCtr.ff();
    }
    rsp.send('Hello World!');
});

// curl http://localhost:8080/switch1/off
app.get('/switch1/off', function (req, rsp) {
    console.log('http::off');
    if (sunShadeCtr) {
        sunShadeCtr.fb();
    }
    rsp.send('Hello World!');
});

app.listen(8080, function() {
    console.log('app listening on port 8080!');
});

