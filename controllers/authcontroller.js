const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config')
const db = require('../dbService');
const router = express.Router();

/**
 * login method
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.login = (req, res, next) => {
    const { username, password } = req.body;
    //validation
    if (!username || !password) {
        return res.status(422).json({ error: "please add email or password" })
    }
    const conn = db.getConnetion();

    conn.query('SELECT * FROM tbl_user_info WHERE uname = ? and status=? LIMIT 1', [username, 'Y'], function (error, results) {
        if (error) {
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            if (results.length > 0) {
                const user = results[0];
                
                conn.query('SELECT * FROM roles WHERE id=? LIMIT 1', [results[0].role], function (error, roledata) {

                    if (error) {
                        return res.status(400).json({
                            "error": true,
                            "message": "error ocurred"
                        })
                    } else {
                        if (roledata.length > 0) {
                            const role = roledata[0];

                            const token = jwt.sign(
                                {
                                    uname: user.uname,
                                    id: user.id
                                }, JWT_SECRET

                            );
                            delete user.password;
                            res.status(200).json({
                                token: token,
                                role: role.name,
                                data: {
                                    ...user,
                                    role: role
                                }
                            })
                        } else {
                            res.status(400).json({
                                error: true,
                                message: "No role defined",
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
