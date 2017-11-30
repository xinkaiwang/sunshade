'use strict'

var client = require('./robotShadeClient');

// var opt = {
//     profileId: 20002,
//     macAddr: 'b8:27:eb:6c:bc:92',
//     boardId: '28-0516a72226ff',
//     localIpAddr: '10.0.1.213'
// };
// client.registerSession(opt, function(err, result) {
//     if (err) {
//         console.error(err);
//     } else {
//         console.log('result=' + JSON.stringify(result));
//     }
// });



var opt = {
    sessionId: 20,
    action: 'on',
    source: 'wemo'
};
client.reportAction(opt, function(err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log('result=' + JSON.stringify(result));
    }
});
