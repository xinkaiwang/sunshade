'use strict'

var _ = require('underscore');
var express = require('express');
var app = express();

var wemore = require('wemore');
var ip = require('./localIpAddr');
var weMoId = 'SunShade' + _.last(ip.split('.'));
var weMoPort = 9002;
var we = wemore.Emulate({friendlyName: weMoId, port: weMoPort});
console.log('weMo started, friendlyName='+weMoId+' port=' + weMoPort);

var sunShadeCtr = null;
require('./sunShadeCtr')(function (err, ss) {
    sunShadeCtr = ss;
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
