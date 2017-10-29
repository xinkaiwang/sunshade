'use strict'

var express = require('express');
var app = express();

var wemore = require('wemore');
var we = wemore.Emulate({friendlyName: "SunShade"}); // automatically assigned port

var sunShadeCtr = null;
require('./sunShadeCtr')(function (err, ss) {
    sunShadeCtr = ss;
});

// curl http://localhost:8080/switch1/on
app.get('/switch1/on', function (req, rsp) {
    console.log('on');
    if (sunShadeCtr) {
        sunShadeCtr.ff();
    }
    rsp.send('Hello World!');
});

// curl http://localhost:8080/switch1/off
app.get('/switch1/off', function (req, rsp) {
    console.log('off');
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
    if (sunShadeCtr) {
        sunShadeCtr.ff();
    }
    console.log("SunShade turned on");
});

we.on('off', function() {
    if (sunShadeCtr) {
        sunShadeCtr.fb();
    }
    console.log("SunShade turned off");
});
