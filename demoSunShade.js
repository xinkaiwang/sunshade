'use strict'

var promisify = require('bluebird').promisify;
var sunShadeDev = null;

var currentPos = 0;
function timeout() {
    var newPos = sunShadeDev.getCurrentPos();
    if (newPos != currentPos) {
        console.log(newPos);
        currentPos = newPos;
        if (newPos > -109820 && sunShadeDev.getMotor() > 0) {
            sunShadeDev.setMotor(0);
            process.exit();
        } else if (newPos < -123804 && sunShadeDev.getMotor() < 0) {
            sunShadeDev.setMotor(0);
            process.exit();
        }
    }
}

promisify(require('./sunShadeDev'))()
.then(function(dev) {
    sunShadeDev = dev;
}).then(function() {
    sunShadeDev.setMotor(-1);
    setInterval(timeout, 100);
}).error(function(err) {
    console.log(err);
    process.exit(1);
});

