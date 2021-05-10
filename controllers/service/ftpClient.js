let Client = require('ssh2-sftp-client');
let sftp = new Client();
const { readFileSync } = require('fs');
sftp.connect({
    host: '',
    port: 22, // Normal is 22 port
    username: 'iot',
    password: 'iotpsswd',
    privateKey: readFileSync('D:/15react/iot_pri_pt.ppk')
    // You can use a key file too, read the ssh2 documentation
}).then(() => {
    return sftp.list('/home/iot/Binaryfile/');
}).then(data => {
    console.log(data, 'the data info');
}).catch(err => {
    console.log(err, 'catch error');
});