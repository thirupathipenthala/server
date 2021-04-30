const mysql = require('mysql');
const dotenv = require('dotenv');
const env = process.env;
let connection = null;
dotenv.config();

connection = mysql.createConnection({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    port: env.DB_PORT,
    debug: false,
    multipleStatements: true


});
console.log("db serice");
connection.connect((err) => {
    if (err) {
        console.log(err.message);
    }

    console.log('db ' + connection.state);

});
function getConnetion() {
    console.log('db connection : ' + connection.state);
    return connection;
}


module.exports = { getConnetion };