const mysql = require('../db')

exports.getallOrder= (req, res)=>{
    res.send("All order")
}

exports.getOrderID= (req, res)=>{
    const id = req.body.o_id
    res.send("All order" + id)
}


