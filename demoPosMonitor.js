'use strict'

var monitor = require('./posMonitor')();

var v = 0;
var pos = 20000;
function timeout() {
  var newVal = monitor.update().getValue();
  if (newVal != v) {
    var diff = newVal - v;
    v = newVal;
    if (diff < - 128) {
      diff += 256;
    } else if (diff > 128) {
      diff -= 256;
    }
    pos += diff;
    console.log(''+v + ', d='+diff + ', pos=' + pos);
  }
  setTimeout(timeout, 10);
}

timeout();