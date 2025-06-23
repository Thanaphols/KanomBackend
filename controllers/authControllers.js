const conn = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
exports.register = async (req,res)=>{
    const { u_userName ,de_firstName,de_lastName,de_tel, u_passWord } = req.body
    try {
        if (!u_userName || !de_firstName || !de_lastName || !de_tel || !u_passWord) {
            return res.status(400).send({message : 'Please Enter All Data'})
        }
        const checkUserSQL = 'SELECT u_userName FROM users WHERE u_userName = ?'
        const [userCheck] = await conn.query(checkUserSQL,[u_userName])
        if (userCheck.length > 0){
            return res.status(409).send({message: 'Username Already Taken'})
        }
        const passwordHash = await bcrypt.hash(u_passWord,10)
        const insertUserSQL = 'INSERT INTO users (u_userName,u_passWord) VALUES (?,?) '
        const [userResult] = await conn.query(insertUserSQL,[u_userName,passwordHash])
        if (userResult.affectedRows ===0 ) {
            return res.status(401).send({message: 'Insert User Unsuccess'})
        }
        const u_ID = userResult.insertId
        const insertUserDetailSQL = 'INSERT INTO usersdetail (u_ID,de_firstName,de_lastName,de_tel) VALUES (?,?,?,?)'
        const [detailResult] = await conn.query(insertUserDetailSQL,[u_ID,de_firstName,de_lastName,de_tel])
        if (detailResult.affectedRows === 0) {
            return res.status(400).send({message : 'Insert Detail Unsuccess'})
        }
        return res.status(201).send({message:'Register Success'})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : 'Somthing Weng Wrongs'})
    }
}

exports.login = async (req,res)=>{
    try {
        const {username,password} = req.body
        if(!username || !password) {
            return res.status(401).send({message : 'Please Enter all Data'})
        }
        const sql  = ('SELECT * FROM users WHERE u_userName = ?')
        const [userCheck] = await conn.query(sql,[username])
        if(userCheck.length === 0) {
            return res.status(409).send({message : 'Username not found in the system'})
        }
        const dataUser = userCheck[0];
        const match = await bcrypt.compare(password,dataUser.u_passWord)
        if(!match) {
            return res.status(400).send({message: 'Login failed (wrong username or password)' })
        }
        const userData = {

            u_userName: dataUser.u_userName ,
            u_role : dataUser.u_role
        }
        const secret = process.env.SECRET_KEY_Token
        const options = {expiresIn: '1h'}
        const token = jwt.sign(userData,secret,options)
        return res.status(200).send({message: 'Login Success ', token ,userData})
    } catch (error) {
        console.log(error)
        return res.status(409).send({message:'Something Weng Wrongs'})
    }
}

exports.checkUser = async (req,res) =>{
    const {u_userName} = req.body
    try {
        if (!u_userName) {
            return res.status(400).send({message : `Please Enter Username`})
        }
        const SQL = `SELECT * FROM users WHERE u_userName = ?`
        const [result] = await conn.query(SQL,[u_userName])
        if (result.length > 0) {
            return res.status(400).send({message : `Username Already Used`})
        }
        return res.status(200).send({message : `A username can be used`})
    } catch (error) {
        console.log(error)
        return res.statuts(500).send({message : `Something Went Wrong`})
    }
}
