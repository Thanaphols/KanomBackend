const conn = require('../db')
exports.getallProduct = async (req,res)=>{
    try {
    const SQL = `SELECT  product.p_ID,product.c_ID,product.p_Name,product.p_Detail,product.p_Price,product.p_Amount,p_Img,category.c_Name 
    FROM product INNER JOIN category ON product.c_ID = category.c_ID ORDER BY p_ID `
    const [result] = await conn.query(SQL)
    const data = result
        return res.status(200).send({message: "Select Success", data , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : 'Someting Went Wrong' , status : 0})
    }
}
exports.addProduct = async (req, res) => {
    const { p_Name,p_Detail,p_Price,c_ID} = req.body
    try {
       if (!p_Name || !p_Detail || p_Price == null || p_Price == undefined || c_ID == null || c_ID == undefined ) {
        return res.status(400).send({message : "Please Enter All Data"})
    }
        const checkSQL = `SELECT * FROM category Where c_ID = ?`
        const [checkResult] =  await conn.query(checkSQL,[c_ID])
        if(checkResult.length === 0) {
            return res.status(400).send({message: 'Unknow Category', status : 0})
        }
        console.log(c_ID)
        const SQL = `INSERT INTO product ( p_Name,p_Detail,p_Price,c_ID  ) VALUES ( ?,?,?,? ) `
        const [result] = await conn.query(SQL, [p_Name,p_Detail,p_Price ,c_ID ] )
        if(result.affectedRows === 0) {
            return res.status(401).send( {message: "Can't create Product " , status : 0})
        }
        return res.status(201).send( {  message : "Create Product Success", status : 1})
    } catch (error) {
        console.log(error)
        return res.status(401).send({message : 'Something Went Wrong', status : 0})
    }
};

exports.getProductID = async (req,res)=>{
    const {p_id} = req.params
    try {
        if(!p_id) {
            return res.status(400).send({message : 'ID product is missing Please Try agina later'})
        }
        const SQL = "SELECT * FROM product WHERE p_id = ?"
        const [result] = await conn.query(SQL,[p_id])
        if(result.length === 0) {
            return res.status(401).send({message : 'Unknow Product ID : ' + p_id , status : 0})
        }
        const data = result[0]
        return res.status(201).send({message : 'Select Product ID : ' + p_id , data : data , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(400).send({message: 'Something Went Wrong', status : 0})
    }
}

exports.updateProduct = async (req,res)=>{
    const { p_ID,p_Name,p_Detail,p_Price,c_ID} = req.body
    const io =req.app.get('io')
    try {
        if (!p_ID || !p_Name || !p_Detail || p_Price == null || p_Price == undefined || c_ID == null || c_ID == undefined) {
            return res.status(400).send({message : 'Please Enter All Data', status : 0})
        }
        if (p_Price < 0) {
            return res.status(400).send({message : `Price Can't below 0`, status : 0})
        } 
        const checkSQL = `SELECT * FROM product WHERE p_id = ?`
        const [checkResult] = await conn.query(checkSQL,[p_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({message : `Unknow Product ID : ${p_ID}` , status : 0})
        }
        const checkCategorySQL = `SELECT * FROM category WHERE c_ID = ?`
        const [checkCategoryResult] = await conn.query(checkCategorySQL,[c_ID])
        if (checkCategoryResult.length === 0) {
            return res.status(404).send({message : `Unknow Categoru ID : ${c_ID}` , status : 0})
        }
        const updateSQL = `UPDATE product SET p_Name = ? , p_Detail = ? , p_Price = ?  , c_ID = ?  WHERE p_ID = ? `
        const [updateResult] = await conn.query(updateSQL,[p_Name,p_Detail,p_Price,c_ID,p_ID])
        if (updateResult.affectedRows === 0) {
            return res.status(400).send({message : `Update Product ID : ${p_ID} Unsuccessfully` , status : 0})
        }
        io.emit('refreshProduct')
        return res.status(200).send({message : `Update Product ID : ${p_ID} Successfully`, status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : 'Something Went Wrong' , status : 0})
    }
}

exports.deleteProduct = async (req,res) => {
    const {p_ID} = req.body
    try {
        if (!p_ID) {
            return res.status(400).send({message : `Missing Product ID ` , status : 0})
        }
        const checkSQL = `SELECT * FROM pruduct WHERE p_ID = ?`
        const [checkResult] = await conn.query(checkSQL,[p_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({message : `Unknow Product ID : ${p_ID}`, status : 0})
        }
        const deleteSQL = `DELETE FROM product WHERE p_ID = ?`
        const [deleteResult] = await conn.query(deleteSQL,[p_ID])
        if (deleteResult.affectedRows === 0) {
            return res.status(400).send({message : `Delete Product ID : ${p_ID} Unsuccessfully`, status : 0})
        }
        return res.status(400).send({message : `Delete Product ID : ${p_ID} Successfully`, status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Something Went Wrong`, status : 0})
    }
}