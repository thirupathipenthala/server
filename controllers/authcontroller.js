const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config')
const db = require('../dbService');
const router = express.Router();


exports.login = (req, res, next) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(422).json({ error: "please add email or password" })
    }
    let results;
    const conn = db.getConnetion();

    conn.query('SELECT * FROM tbl_user_info WHERE uname = ? and status=?', [username, 'Y'], function (error, results, fields) {
        if (error) {
            return res.status(400).json({
                "failed": "error ocurred"
            })
        } else {
            if (results.length > 0) {
                console.log(results[0].uname);
                console.log(results[0].role);
                /*const comparision = bcrypt.compare(password, results[0].password);
                if (!(results[0].uname.trim() === username.trim())) {
                    return res.json({
                        message: "username does not match"
                    });
                }
                */
                conn.query('SELECT * FROM roles WHERE id=?', [results[0].role], function (error, roledata, fields) {
                    console.log(roledata.length)
                    if (error) {
                        return res.status(400).json({
                            "failed": "error ocurred"
                        })
                    } else {
                        if (roledata.length > 0) {
                            for (var i of results) {
                                console.log(i);
                                roledata.push(i);
                            }
                            console.log(roledata[0].name);
                            console.log(roledata[0].id);
                            console.log(roledata[0].uname);
                            const token = jwt.sign(
                                {
                                    uname: results[0].uname,
                                    id: results[0].id
                                }, JWT_SECRET

                            );
                            res.status(200).json({
                                token: token,
                                role: roledata[0].name
                            })
                        } else {
                            res.json({
                                role: "No role defined",
                            })
                        }
                    }
                });
            }
        }
    });
}

exports.forgetpassword = (req, res, next) => {
    const { email } = req.body;
    console.log("email :" + email)
    const conn = db.getConnetion();
    conn.query('SELECT * FROM tbl_user_info WHERE emailId = ? and status=?', [email, 'Y'], function (error, results, fields) {
        console.log(results.length)
        if (error) {
            return res.status(400).json({
                message: "error ocurred"
            })
        } else {
            if (results.length > 0) {
                console.log(results[0].emailId)

                res.status(200).json({
                    message: "OK"
                })
            }
        }
    });

}
