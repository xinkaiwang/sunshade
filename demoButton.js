'use strict'

var button = require('perf-gpio').button;

var forwardButton = button(14, 'PUD_UP'); // wiringPi_14=gpio_11

forwardButton.watch(function(err, buttonStatus) {
    console.log(buttonStatus? "true":"false");
});

var exit = false;
(function wait () {
   if (!exit) setTimeout(wait, 1000);
})();