const conn = require('../db')

exports.getallProduct = (req, res)=>{
    res.send("All product")
}
exports.addProduct = async (req, res) => {
    const [ id,name,detail,price,amount] = req.body
    
    if (name == undefined || detail == undefined || price == undefined || amount == undefined || id == undefined ){
        return res.status(400).send({message : "Please Enter All Data"})
    }
    const SQL = `INSERT INTO product ( p_Name,p_Detail,p_Price,p_Amount,c_ID  ) VALUES ( ?,?,?,?,? ) `
    conn.query(SQL, [name,detail,price,amount ,id ] , (err)=>{
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
        const SQL = "SELECT * FROM product WHERE p_id = ?"
        conn.query(SQL,[id],(err,data)=>{
            if(err){
                return res.stauts(401).send({message : 'Something Wrongs'})
            }else{
                return res.status(201).send({message : 'Select Product ID : '+id , data : data})
            }
        })
    }
}