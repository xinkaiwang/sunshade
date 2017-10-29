'use strict'

var ds18b20 = require('ds18b20');
var _ = require('underscore');

function findGoodId(ids) {
    var foundId = null;
    _.each(ids, function(id, memo) {
        if (!foundId) {
            if (id.lastIndexOf('28-', 0) === 0) {
                foundId = id;
            }
        }
    });
    return foundId;
}

function read(cb) {
    ds18b20.sensors(function(err, ids) {
        if (err) {
            cb(err);
        }
        // console.log('ids=' + JSON.stringify(ids));
        var id = findGoodId(ids);
        if (id) {
            ds18b20.temperature(id, cb);
        } else {
            cb('no sensors found');
        }
    });
}

module.exports.read = read;
