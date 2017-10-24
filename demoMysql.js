
var sql = require('./mysqlStore');

sql.getAll(function(err, data) {
    console.log('get done');
    console.log(JSON.stringify(data));

    var setData = {
        'testKey': 'testVal3',
        currentPos: 160
    }
    sql.set(setData, function(err) {
        console.log('set done');
        sql.getAll(function(err, data2) {
            console.log('get done');
            console.log(JSON.stringify(data2));
            process.exit();
        });
    });
});

