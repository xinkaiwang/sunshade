'use strict'

var _ = require('underscore');
var request = require('request');
var baseUrl = 'http://api.robotshade.com/sunshade/'

// var opt = {
//     profileId: profileId,
//     macAddr: macAddr,
//     boardId: boardId,
//     localIpAddr: localIpAddr
// };
function registerSession(opt, cb) {
    var params = {
        profile: opt.profileId,
        mac: opt.macAddr,
        board: opt.boardId,
        lip: opt.localIpAddr
    };
    var str = _.reduce(params, function(memo, v, k) {memo.push(k + '=' + v); return memo;}, []).join('&');
    var url = baseUrl + 'registerSession?' + str;
    console.log(url);
    request(url, function(err, response, body) {
        // console.log('response = ' + body);
        if (err) {
            cb(err);
        } else {
            // console.log('response = ' + JSON.stringify(response));
            if (response.statusCode >= 200 && response.statusCode < 300) {
                var err = null;
                var json = null;
                try {
                    json = JSON.parse(body);
                } catch (ex) {
                    console.error('unable to parse response as json: ' + ex);
                    err = new Error('FailToParseResponseBody');
                }
                cb(err, json);
            } else {
                cb(new Error('ResponseCode' + response.statusCode));
            }
        }
    });
}

// var opt = {
//     sessionId: sessionId,
//     action: action,
//     source: source,
//     temperature: temperature
// };
function reportAction(opt, cb) {
    var params = {
        session: opt.sessionId,
        action: opt.action,
        src: opt.source
    };
    if ('temperature' in opt) { // this is to handle corner case when temperature not exist, or temperature=0.0 degree
        params.temp = opt.temperature;
    }
    var str = _.reduce(params, function(memo, v, k) {memo.push(k + '=' + v); return memo;}, []).join('&');
    var url = baseUrl + 'reportAction?' + str;
    console.log(url);
    request(url, function(err, response, body) {
        // console.log('response = ' + body);
        if (err) {
            cb(err);
        } else {
            // console.log('response = ' + JSON.stringify(response));
            if (response.statusCode >= 200 && response.statusCode < 300) {
                var err = null;
                var json = null;
                try {
                    json = JSON.parse(body);
                } catch (ex) {
                    console.error('unable to parse response as json: ' + ex);
                    err = new Error('FailToParseResponseBody');
                }
                cb(err, json);
            } else {
                cb(new Error('ResponseCode' + response.statusCode));
            }
        }
    });
}

// var opt = {
//     sessionId: sessionId,
//     now: (new Date()).toISOString(),
//     temperature: temperature
// };
function heartbeat(opt, cb) {
    var params = {
        session: opt.sessionId,
        now: opt.now,
        temp: opt.temperature
    };
    var str = _.reduce(params, function(memo, v, k) {memo.push(k + '=' + v); return memo;}, []).join('&');
    var url = baseUrl + 'heartbeat?' + str;
    console.log(url);
    request(url, function(err, response, body) {
        // console.log('response = ' + body);
        if (err) {
            cb(err);
        } else {
            // console.log('response = ' + JSON.stringify(response));
            if (response.statusCode >= 200 && response.statusCode < 300) {
                var err = null;
                var json = null;
                try {
                    json = JSON.parse(body);
                } catch (ex) {
                    console.error('unable to parse response as json: ' + ex);
                    err = new Error('FailToParseResponseBody');
                }
                cb(err, json);
            } else {
                cb(new Error('ResponseCode' + response.statusCode));
            }
        }
    });
}

module.exports = {
    registerSession: registerSession,
    reportAction: reportAction,
    heartbeat: heartbeat
};