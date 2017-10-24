'use strict'

var mysql = require('mysql');
var encoder = require('./encoder');
var _ = require('underscore');
var Promise = require('bluebird');
var promisify = require('bluebird').promisify;

var options = {
  host     : 'localhost',
  user: 'foo3',
  password: 'password',
  database : 'piz'
};

if ('MYSQL_USER' in process.env) {
    options.user = process.env['MYSQL_USER'];
}
if ('MYSQL_PASSWORD' in process.env) {
    options.password = process.env['MYSQL_PASSWORD'];
}

var pool = mysql.createPool(options);

// connection.connect();

/*
CREATE TABLE `status` (
  `attr` VARCHAR(100) NOT NULL,
  `val` VARCHAR(5000) NULL,
  `last_modified` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`attr`));
*/

/*
INSERT INTO status (attr, val)
VALUES ('testAttr','10');
*/

// return a map, key-value pair <string,string>
var current = {};
function getAllRaw(cb) {
  pool.query("SELECT attr, val, last_modified FROM status", function (error, results, fields) {
    if(error) {
      cb(error);
    } else {
      var ret = {};
      _.map(results, function(item) {
        // console.log('The solution is: ', item);
        ret[item.attr] = item.val;
      });
      current = _.clone(ret);
      cb(null, ret);
    }
  });
}

function insert(key, val, cb) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            connection.query('INSERT INTO status SET ?', {attr: key, val: ''+ val}, function(err, result) {
                connection.release();
                cb(err, result);
            });
        }
    });
}

function update(key, val, cb) {
    pool.getConnection(function(err, connection) {
        if (err) {
            console.log(JSON.stringify(err));
            cb(err);
        } else {
            connection.query('UPDATE status SET val = ? WHERE attr = ?', [val, key], function(err, result) {
                connection.release();
                cb(err, result);
            });
        }
    });
}

function setRaw(data, cb) {
    var list = [];
    _.each(data, function(val, key) {
        if (! (key in current)) {
            // need to insert new row
            list.push(promisify(insert)(key, val));
        } else if (current[key] != val) {
            list.push(promisify(update)(key, val));
        }
    });
    Promise.all(list).then(function() {
        cb();
    });
}

process.on('exit', function(code) {
  console.log('sqlStore::disconnecting mysql');
  pool.end();
  console.log('sqlStore::disconneced');
});

module.exports = {
  getAll: function(cb) { getAllRaw(function(err, data) { cb(err, encoder.decode(data)); }) },
  set: function(data, cb) { setRaw(encoder.encode(data), cb); }
};
