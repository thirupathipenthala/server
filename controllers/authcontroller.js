const express = require("express");
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config')
const db = require('../dbService');
var dateFormat = require('dateformat');
var nodeoutlook = require('nodejs-nodemailer-outlook')
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
                var val = Math.floor(1000 + Math.random() * 900000);
                nodeoutlook.sendEmail({
                    auth: {
                        user: "u_tpentala@iconectiv.com",
                        pass: ""
                    },
                    from: 'u_tpentala@iconectiv.com',
                    to: 'thirupathi@techtez.com',
                    subject: 'FOTA ForgotPassword!',
                    html: "<p>Your Password : " + val + "</p>",

                    onError: (e) => {
                        return res.json({
                            "message": "Something worng to send mesg"
                        })
                    },
                    /* onSuccess: (i) => {
                         return res.json({
                             "message": "Please check your email"
                         })
                     }*/
                }


                );

            }
        }
    });

}


exports.getDeviceFirmware = (req, res) => {
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const offset = (page - 1) * limit;
    const conn = db.getConnetion();
    conn.query(`select id,fota_txnId,status,version,file_name,description,compatible_hw,created_dt,approval_dt,rejection_dt,remarks,checksum from tbl_iot_device_firmware order by id desc LIMIT ${limit} OFFSET ${offset}`, function (error, deviceData) {
        if (error) {
            console.log(error)
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            conn.query('select COUNT(*) as total from tbl_iot_device_firmware', function (error, countData) {
                if (error) {
                    return res.status(400).json({
                        "error": true,
                        "message": "error ocurred"
                    })
                } else {
                    const total = countData[0].total;
                    return res.json({
                        "error": false,
                        "data": deviceData,
                        total
                    })
                }
            })


        }

    });

}


exports.deleteFirmware = (req, res) => {
    const id = req.params.id;
    const conn = db.getConnetion();
    conn.query(`DELETE FROM tbl_iot_device_firmware WHERE id = ${id}`, function (error) {
        if (error) {
            console.log(error)
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            conn.query(`DELETE FROM tbl_fota_device_info WHERE fotaId = ${id}`, function (error) {

                if (error) {
                    console.log(error)
                    return res.status(400).json({
                        "error": true,
                        "message": "error ocurred"
                    })
                }
                return res.json({
                    "error": false
                })
            })
        }
    })
}


exports.viewFirmware = (req, res) => {
    const id = req.params.id;
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 10);
    const offset = (page - 1) * limit;

    const conn = db.getConnetion();
    conn.query(`SELECT * FROM tbl_fota_device_info WHERE fotaId = ${id} LIMIT ${limit} OFFSET ${offset}`, function (error, data) {
        if (error) {
            console.log(error)
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            conn.query(`select COUNT(*) as total from tbl_fota_device_info WHERE fotaId = ${id}`, function (error, countData) {
                if (error) {
                    return res.status(400).json({
                        "error": true,
                        "message": "error ocurred"
                    })
                } else {

                    return res.json({
                        "error": false,
                        data,
                        total: countData[0].total
                    })
                }
            })
        }
    })
}

exports.firmwareUplode = (req, res) => {
    //console.log(req.body);
    const x = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    var fota_txnId = dateFormat(new Date(), "ddhhssmm");
    //console.log("" + req.params.description)
    let data = {
        file: req.file, file_name: req.body.file_name, version: req.body.version,
        status: 'Pending', created_dt: x, checksum: req.file.size, description: req.body.description,
        fota_txnId: fota_txnId

    };

    const devices = JSON.parse(req.body.devices);

    let sql = "INSERT INTO tbl_iot_device_firmware SET ?";
    const conn = db.getConnetion();
    conn.query(sql, data, function (error, results) {
        if (error) {
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            for (let index = 0; index < devices.length; index++) {
                let element = {
                    serialNo: devices[index].serialNo, devType: devices[index].devType, fotaId: req.body.fotaId, group_name: req.body.group_name, status: 'Pending'
                };
                // console.log(element)
                let sql = "INSERT INTO tbl_fota_device_info SET ?";
                conn.query(sql, element, function (error, results) {
                    if (error) {
                        return res.status(400).json({
                            "error": true,
                            "message": "error ocurred"
                        })
                    } else {
                        if (index + 1 === devices.length) {
                            // console.log(index + 1 + ":" + devices.length)
                            return res.json({
                                data: "sucess"
                            })
                        }
                    }
                });
            }
        }
    });
}

exports.updateFirmware = (req, res) => {
    let deviceId = req.params.id
    const x = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    const conn = db.getConnetion();
    conn.query('Update tbl_iot_device_firmware Set status =? , approval_dt =? WHERE id =?', ['Approved', x, deviceId], function (error, result) {
        if (error) {
            console.log(error)
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            numRows = result.affectedRows;
            return res.json({
                "error": false,
                total: numRows
            })
        }

    });
}

exports.scheduledDataByFotaToFTPHandler = (req, res) => {
    let id = req.body.id || '69';
    let scheduledDT = req.body.scheduledDT;
    let param = req.body.param || 'fotaSchedule';
    let host = req.body.host;
    let userName = req.body.userName;
    let passwrd = req.body.passwrd;
    const x = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
    const conn = db.getConnetion();
    conn.query(`select * from tbl_iot_device_firmware WHERE id = ${id}`, function (error, result) {
        if (error) {
            console.log(error)
            return res.status(400).json({
                "error": true,
                "message": "error ocurred"
            })
        } else {
            numRows = result.length;
            console.log(result[0].file)
            console.log(result[0].file_name)
            console.log(numRows)
            if (numRows > 0) {
                let element = {
                    parameter_name: param, parameter_value: x, fotaId: id
                };
                let sql = "INSERT INTO tbl_configuration SET ?";
                conn.query(sql, element, function (error, result) {
                    if (error) {
                        console.log(error)
                        return res.status(400).json({
                            "error": true,
                            "message": "error ocurred"
                        })
                    } else {
                        res.json({
                            "error": false,
                            "messgae": 'sucess'
                        })
                    }
                })
            }
        }
    });
}
