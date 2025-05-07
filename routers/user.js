const express = require("express")
const router = express.Router()

router.get('/',(req,res)=>{
    res.send("Here user")
})


module.exports = router