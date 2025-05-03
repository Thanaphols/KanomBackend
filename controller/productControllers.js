const mysql = require('../db')

exports.getallProduct = (req, res)=>{
    res.send("All product")
}
exports.addProduct = (req, res) => {
    let id = req.body.p_ID
    console.log(id)
    mysql.query("SELECT * FROM product", (err,data)=>{
       if(err){
        return res.status(401).send( {message: "Can't read Data"})
       }else{
        return res.status(201).send( {  Data : data , ID : id})
       }
    })
  };

exports.getProductID = (req,res)=>{
     const pID = req.params.p_id
        res.send("Here Product "+pID)
}