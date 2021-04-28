const jwt = require('jsonwebtoken')
const { JWT_SECRET } = require('../config')
const db = require('../dbService');


module.exports = (req, res, next) => {
    const { authorization } = req.headers
    console.log(authorization)
    //authorization === Bearer ewefwegwrherhe
    if (!authorization) {
        return res.status(401).json({ error: "you must be logged in" })
    }
    const token = authorization.replace("Bearer ", "")
    jwt.verify(token, JWT_SECRET, (err, payload) => {

        console.log(JSON.stringify(payload));
        if (err) {
            return res.status(401).json({ error: "you must be loggedin" })
        }

        const { uname, id } = payload

        console.log("name :" + uname + " :id :" + id)
        const conn = db.getConnetion();
        conn.query('SELECT * FROM tbl_user_info WHERE uname = ? and id=?', [uname, id], function (error, results, fields) {
            if (error) {
                return res.status(400).json({

                    "failed": "error ocurred"
                })
            } else {
                if (results.length > 0) {
                    console.log("after login :" + results[0].password)
                    req.results = results

                    next()
                }
            }
        });



    })
}