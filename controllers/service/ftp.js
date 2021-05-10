var Client = require('ftp');
var fs = require('fs');
var connSettings = {
    host: '',
    port: 22, // Normal is 22 port
    username: 'iot',
    password: 'iotpsswd',
    //
    privateKey: fs.readFileSync('D:/15react/iot_pri_pt.ppk')
    // You can use a key file too, read the ssh2 documentation
};
var c = new Client(connSettings);
c.on('ready', function () {
    c.list('/home/iot/Binaryfile/', function (err, list) {
        if (err) throw err;
        console.dir("list on the dir " + list);
        c.end();
    });
});
// connect to localhost:21 as anonymous
c.connect();