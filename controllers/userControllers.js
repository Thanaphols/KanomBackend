const conn = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
exports.editProfile = async (req,res)=>{
    
   return res.status(200).send({message : "Edit Success" , status : 1})
}

exports.getUser = async (req,res)=>{
   try {
      const selectSQL = `SELECT u_ID,u_userName FROM users`
      const [result] = await conn.query(selectSQL,[])
      if (result.length ===0) {
         return res.status(404).send({message : `No user Data`,status : 0})
      }
      const data = result
      return res.status(200).send({message : `Select All User Data Successfully` , data ,status : 1})
   } catch (error) {
      console.log(error)
      return res.status(500).send({message : `Something Went Wrongs`})
   }
}

exports.dashBoard = async (req,res)=>{
   try {
      
   } catch (error) {
      console.log(error)
      return res.status(500).send({message : `Something Went Wrongs`})
   }
}