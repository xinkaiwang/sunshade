'use strict'

var wemore = require('wemore');
var _ = require('underscore');

var localIpAddr = require('./localIpAddr');
var lastPartOfIpAddr = _.last(localIpAddr.split('.'));

console.log('lastPartOfIpAddr='+lastPartOfIpAddr);

var sunshade = wemore.Emulate({
  friendlyName: "SunShade" + lastPartOfIpAddr
}); // automatically assigned port

sunshade.on('listening', function() {
    // if you want it, you can get it:
    console.log("Stereo listening on", this.port);
});

// also, 'on' and 'off' events corresponding to binary state
sunshade.on('on', function() {
    console.log("Stereo turned on");
});

sunshade.on('off', function() {
    console.log("Stereo turned off");
});
