const mysql = require('../db')

exports.getallProduct = (req, res)=>{
    res.send("All product")
}
exports.addProduct = (req, res) => {
    let id = req.body.c_ID
    let name = req.body.p_Name
    let detail = req.body.p_Detail
    let price = req.body.p_Price
    let quatity = req.body.p_Quatity
    if (name == undefined || detail == undefined || price == undefined || quatity == undefined || id == undefined ){
        return res.status(400).send({message : "Please Enter All Data"})
    }
    console.log(name)
    mysql.query("INSERT INTO product ( p_Name,p_Detail,p_Price,p_Quatity,c_ID  ) VALUES ( ?,?,?,?,? ) ", [name,detail,price,quatity ,id ] , (err)=>{
       if(err){
        console.log(err)
        return res.status(401).send( {message: "Can't create Product "})
       }else{
        return res.status(201).send( {  message : "Create Product Success"})
       }
    })
  };

exports.getProductID = (req,res)=>{
     const id = req.params.p_id
    if (id == undefined || id == ''){
        return res.status(400).send({message : 'ID product is missing Please Try agina later'})
    }else{
        mysql.query("SELECT * FROM product WHERE p_id = ?",[id],(err,data)=>{
            if(err){
                return res.stauts(401).send({message : 'Something Wrongs'})
            }else{
                return res.status(201).send({message : 'Select Product ID : '+id , data : data})
            }
        })
    }

}