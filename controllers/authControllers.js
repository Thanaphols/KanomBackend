// authcontrollers.js
const conn = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
exports.register = async (req, res) => {
    const { u_userName, de_tel, u_passWord } = req.body
    try {
        if (!u_userName || !de_tel || !u_passWord) {
            return res.status(400).send({ message: 'Please Enter All Data', status: 0 })
        }
        const checkUserSQL = 'SELECT u_userName FROM users WHERE u_userName = ?'
        const [userCheck] = await conn.query(checkUserSQL, [u_userName])
        if (userCheck.length > 0) {
            return res.status(409).send({ message: 'Username Already Taken', status: 0 })
        }
        const passwordHash = await bcrypt.hash(u_passWord, 10)
        const insertUserSQL = 'INSERT INTO users (u_userName,u_passWord) VALUES (?,?) '
        const [userResult] = await conn.query(insertUserSQL, [u_userName, passwordHash])
        if (userResult.affectedRows === 0) {
            return res.status(401).send({ message: 'Insert User Unsuccess', status: 0 })
        }
        const u_ID = userResult.insertId
        const insertUserDetailSQL = 'INSERT INTO usersdetail (u_ID,de_tel) VALUES (?,?)'
        const [detailResult] = await conn.query(insertUserDetailSQL, [u_ID, de_tel])
        if (detailResult.affectedRows === 0) {
            return res.status(400).send({ message: 'Insert Detail Unsuccess', status: 0 })
        }
        return res.status(201).send({ message: 'Register Success', status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Somthing Weng Wrongs', status: 0 })
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(401).send({ message: 'Please Enter all Data', status: 0 })
        }
        const sql = ('SELECT * FROM users WHERE u_userName = ?')
        const [userCheck] = await conn.query(sql, [username])
        if (userCheck.length === 0) {
            return res.status(409).send({ message: 'Username not found in the system', status: 0 })
        }
        const dataUser = userCheck[0];
        const match = await bcrypt.compare(password, dataUser.u_passWord)
        if (!match) {
            return res.status(400).send({ message: 'Login failed (wrong username or password)', status: 0 })
        }
        const userData = {
            u_ID: dataUser.u_ID,
            u_userName: dataUser.u_userName,
            u_role: dataUser.u_role
        }
        const secret = process.env.SECRET_KEY_Token
        const options = { expiresIn: '3h' }
        const token = jwt.sign(userData, secret, options)
        return res.status(200).send({ message: 'Login Success ', token, userData, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(409).send({ message: 'Something Weng Wrongs', status: 0 })
    }
}

exports.checkUser = async (req, res) => {
    const { u_userName } = req.body
    try {
        if (!u_userName) {
            return res.status(400).send({ message: `Please Enter Username`, status: 0 })
        }
        const SQL = `SELECT * FROM users WHERE u_userName = ?`
        const [result] = await conn.query(SQL, [u_userName])
        if (result.length > 0) {
            return res.status(400).send({ message: `Username Already Used`, status: 0 })
        }
        return res.status(200).send({ message: `A username can be used`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Something Went Wrong`, status: 0 })
    }
}

exports.updateProfile = async (req, res) => {
    const { u_ID, de_tel, de_address, latitude, longitude } = req.body
    try {
        if (!u_ID || !de_lastName || !de_tel) {
            return res.status(400).send({ message: 'Please Enter All Data' })
        }
        const checkSQL = `SELECT * from users WHERE u_ID = ?`
        const [checkResult] = await conn.query(checkSQL, [u_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({ message: `Unknow User ID : ${u_ID}`, status: 0 })
        }
        const updatetUserDetailSQL = 'UPDATE usersdetail SET  de_tel = ? , de_address = ? , latitude = ? , longitude = ? WHERE u_ID = ?'
        const [updateResult] = await conn.query(updatetUserDetailSQL, [de_tel, de_address, latitude, longitude, u_ID])
        if (updateResult.affectedRows === 0) {
            return res.status(400).send({ message: `Update Profile Unsuccess`, status: 0 })
        }
        return res.status(200).send({ message: `Update Profile Successfully`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Something Went Wrong`, status: 0 })
    }
}

exports.deleteUser = async (req, res) => {
    const { u_ID } = req.body

    return res.status(200).send({ message: `Delete User ID : ${u_ID} Unuccessfully`, status: 0 })
    // try {
    //     if (!u_ID) {
    //         return res.status(400).send({message: `User ID is Missing` , status : 0})
    //     }
    //     const checkUserSQL = `SELECT * FROM users WHERE u_ID = ?`
    //     const [checkUserResult] = await conn.query(checkUserSQL,u_ID)
    //     if (checkUserResult.length === 0) {
    //         return res.status(404).send({message : `Unknow User ID : ${u_ID}` , status : 0})
    //     }
    //     const deleteUserSQL = `DELETE FROM users WHERE u_ID = ?`
    //     const [deleteUserResult] = await conn.query(deleteUserSQL,u_ID)
    //     if (deleteUserResult.affectedRows === 0) {
    //         return res.status(400).send({message : `Delete User ID ${u_ID} Unsuccessfully` , status : 0})
    //     }
    //      return res.status(200).send({message : `Delete User ID ${u_ID} Successfully` , status : 1})
    // } catch (error) {
    //     console.log(error)
    //     return res.statuts(500).send({message : `Something Went Wrong` , status : 0})
    // }
}


exports.checkLogin = (req, res) => {
    const authToken = req.headers['authorization'];
    if (!authToken) return res.status(401).send({ message: 'Unknown Token', status: 0 }); //

    const token = authToken.split(' ')[1];
    jwt.verify(token, process.env.SECRET_KEY_Token, (err, decode) => {
        if (err) {
            return res.status(403).send({ message: 'Token expired', status: 0 }); //
        }
        return res.status(200).send({
            message: `Login Success`,
            status: 1,
            userData: decode
        });
    });
};

// backend/controllers/authController.js
exports.handleLineAuth = async (req, res) => {
    const { u_line_id } = req.body;

    try {
        // ค้นหา User จาก u_line_id เท่านั้น
        const [users] = await conn.query(
            "SELECT u_ID, u_role, u_userName FROM users WHERE u_line_id = ?",
            [u_line_id]
        );

        if (users.length > 0) {
            const user = users[0];
            // สร้าง Token ที่ระบุ Role จริงจากฐานข้อมูล
            const token = jwt.sign(
                { u_ID: user.u_ID, u_role: user.u_role },
                process.env.SECRET_KEY_Token,
                { expiresIn: '1d' }
            );

            return res.status(200).json({
                status: 1,
                token: token,
                userData: user // จะมี u_role: 1 สำหรับแอดมิน
            });
        }

        // ถ้าไม่พบ ให้ส่ง status: 2 เพื่อไปหน้าลงทะเบียนลูกค้าใหม่
        return res.status(200).json({ status: 2, message: "New User" });

    } catch (error) {
        res.status(500).json({ status: 0, message: "Server Error" });
    }
};
