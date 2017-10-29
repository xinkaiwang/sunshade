'use strict'

var wemore = require('wemore');

var sunshade = wemore.Emulate({friendlyName: "SunShade"}); // automatically assigned port

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
