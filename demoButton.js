'use strict'

var button = require('perf-gpio').button;

var forwardButton = button(3, 'PUD_UP');

forwardButton.watch(function(err, buttonStatus) {
    console.log(buttonStatus? "true":"false");
});

var exit = false;
(function wait () {
   if (!exit) setTimeout(wait, 1000);
})();