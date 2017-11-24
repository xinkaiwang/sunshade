var wemore = require('wemore')

// with no args, a Discovery object is returned
//  that emits device events as they're discovered
var discovery = wemore.Discover()
.on('device', function(device) {
    console.log('device found:')
    console.log(device);
    // device.toggleBinaryState();
    // discovery.close(); // stop discovering
});