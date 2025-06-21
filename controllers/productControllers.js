const conn = require('../db')
exports.getallProduct = async (req,res)=>{
    try {
    
    const SQL = "SELECT * FROM product"
    const [result] = await conn.query(SQL)
    const data = result[0]
        return res.status(200).send({message: "Select Success", data})
    } catch (error) {
        return res.status(400).send({message : 'Someing Went Wrongs'})
    }
}
exports.addProduct = async (req, res) => {
    const { p_Name,p_Detail,p_Price,p_Amount,c_ID} = req.body
    try {
       if (!p_Name || !p_Detail|| !p_Price || !p_Amount || !c_ID ) {
        return res.status(400).send({message : "Please Enter All Data"})
    }
        const checkSQL = `SELECT * FROM category Where c_ID = ?`
        const [checkResult] =  await conn.query(checkSQL,[c_ID])
        if(checkResult.length === 0) {
            return res.status(400).send({message: 'Unknow Category'})
        }
        const SQL = `INSERT INTO product ( p_Name,p_Detail,p_Price,p_Amount,c_ID  ) VALUES ( ?,?,?,?,? ) `
        const [result] = await conn.query(SQL, [p_Name,p_Detail,p_Price,p_Amount ,c_ID ] )
        if(result.affectedRows === 0) {
            return res.status(401).send( {message: "Can't create Product "})
        }
        return res.status(201).send( {  message : "Create Product Success"})
    } catch (error) {
        console.log(error)
        return res.status(401).send({message : 'Something Went Wrong'})
    }
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