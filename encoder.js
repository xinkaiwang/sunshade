'use strict'

var _ = require('underscore');

var valueTypes = {
    testAttr: 'int',
    currentPos: 'int',
    topLimit: 'int',
    buttomLimit: 'int',
}

function encode(input) {
    if (!input) {
        return null;
    }
    var output = {};
    _.each(input, function(val, key) {
        if (key in valueTypes) {
            if (valueTypes[key] === 'int') {
                output[key] = input[key].toString();
            } else if (valueTypes[key] === 'string') {
                output[key] = input[key];
            }
        } else {
            output[key] = '' + input[key];
        }
    });
    return output;
}

function decode(input) {
    if (!input) {
        return null;
    }
    var output = {};
    _.each(input, function(val, key) {
        if (key in valueTypes) {
            if (valueTypes[key] === 'int') {
                output[key] = parseInt(input[key], 10);
            } else if (valueTypes[key] === 'string') {
                output[key] = input[key];
            }
        } else {
            output[key] = input[key];
        }
    });
    return output;
}

module.exports = {
    encode: encode,
    decode: decode
};