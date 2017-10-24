'use strict'

var express = require('express');
var app = express();

var sunShadeCtr = null;
require('./sunShadeCtr')(function (err, ss) {
    sunShadeCtr = ss;
});

app.get('/switch1/on', function (req, rsp) {
    console.log('on');
    if (sunShadeCtr) {
        sunShadeCtr.ff();
    }
    rsp.send('Hello World!');
});
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
