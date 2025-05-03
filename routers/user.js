const express = require("express")
const router = express.Router()
const mysql = require('../db')

router.get('/',(req,res)=>{
    res.send("Here user")
})


module.exports = router