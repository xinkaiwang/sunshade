'use strict'

var th = require('./thermo');

th.read(function(err, val) {
  console.log(err);
  console.log(val);
});
