const conn = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config()
exports.register = async (req,res)=>{
    try {
        const { username , password } = req.body
        if(!username || !password){
            return res.status(401).send({message : 'please enter all Data'})
        }
        const SQL1 = 'SELECT * FROM users WHERE u_userName = ?'
        const [userCheck] = await conn.query(SQL1,[username])
        if (userCheck.length > 0){
            return res.status(409).send({message: 'Username already taken'})
        }
        const passwordHash = await bcrypt.hash(password,10)
        const SQL2 = 'INSERT INTO users (u_userName,u_passWord) VALUES (?,?) '
        const [result] = await conn.query(SQL2,[username,passwordHash])
         return res.status(201).send({message:'Register success'})
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
        if(userCheck.length === 0){
           return res.status(409).send({message : 'Username not found in the system'})
        }
        const dataUser = userCheck[0];
        const match = await bcrypt.compare(password,dataUser.u_passWord)
        if(!match){
            return res.status(400).send({message: 'Login failed (wrong username or password)' })
        }
        const userData = {
                username: dataUser.u_userName ,
                role : dataUser.u_role
            }
            const secret = process.env.SECRET_KEY_Token
            const options = {expiresIn: '1h'}
            const token = jwt.sign(userData,secret,options)
        return res.status(200).send({message: 'Login Success ', token})
    } catch (error) {
        console.log(error)
        res.status(409).send({message:'Something Weng Wrongs'})
    }
}

exports.validead

