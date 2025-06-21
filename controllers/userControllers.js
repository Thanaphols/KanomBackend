const conn = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
exports.editProfile = async (req,res)=>{
    
   return res.status(200).send({message : "Edit Success"})
}

exports.getUser = async (req,res)=>{
   const user = req.userName
   console.log('user'  , user)
   return res.status(200).send({message: 'user Data here'})
}