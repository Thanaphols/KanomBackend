const conn = require('../db')

exports.allCategory = async (req,res)=>{
    try {
        const [result] = await conn.query(" SELECT * FROM category ORDER BY c_ID ASC")
        const data = result
        return res.status(200).send({message : "Select All Data success" , data : data  , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(400).send({message : 'Something Went Wrong' , status : 0})
    }
}
exports.selectCategory = async (req,res)=>{
    const {c_ID} = req.params
    try {
        if ( !c_ID  ) {
            return res.status(400).send({message: "Please Enter All Data" , status : 0}) 
        }
        const SQL = " SELECT * FROM category  WHERE c_ID = ? "
        const [result] = await conn.query(SQL,[c_ID])
        if( result.length === 0 ) {
            return res.status(400).send({message : "No Category ID : " + c_ID  , status : 0})
        }
        const data = result[0]
        return res.status(200).send({message : "Select Data Success" , data : data  , status : 1})
    } catch (error) {
        console.log(error)
         return res.status(401).send({message : "Something Went Wrong" , status : 0})
    }
}

exports.addCategory =  async ( req,res) =>{
    const {c_Name} = req.body
    try {
        if (!c_Name) {
            return res.status(400).send({message : " Please Enter All Data " , status : 0})
        }
        const checkCategorySQL = `SELECT * from category where c_Name = ?` 
        const [checkResult] = await conn.query(checkCategorySQL,[c_Name])
        if (checkResult.length > 0) { 
            return res.status(409).send({message: 'Already Have Category Name : ' + c_Name , status : 0})
        }
        const SQL = `INSERT INTO category (c_Name)  VALUES (?)`
        const [result] = await conn.query(SQL,[c_Name])
        if (result.affectedRows === 0) {
            return res.status(401).send({message : " Can't Create Category" , status : 0})
        }
        return res.status(201).send({message: " Create Category Success " , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(401).send({message : " Something Went Wrong " , status : 0})
    }
}

exports.updateCategory = async (req,res)=>{
    const {c_ID , c_Name} = req.body
    try {
        if ( !c_ID || !c_Name) {
            return res.status(400).send({message: "Please Enter All Data" , status : 0}) 
        }
        const checkSQL = `SELECT * FROM category where c_ID = ? `
        const [checkResult] = await conn.query(checkSQL,[c_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({message: 'Unknow Category ID : ' + c_ID , status : 0})
        }
        const updateSQL = `UPDATE  category set c_Name = ?  WHERE c_ID = ?`
        const [result] = await conn.query(updateSQL,[c_Name, c_ID])
        if (result.affectedRows === 0) {
            return res.status(400).send({message : "Can't Update Category" , status : 0})
        }
        return res.status(200).send({message : "Update Category" , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(400).send({message : 'Something Went Wrong' , status : 0})
    }
}

exports.deleteCategory = async (req, res) =>{
    const {c_ID} = req.params
    try {
        if (!c_ID ) {
            return res.status(400).send({message : "Category ID is missing" , status : 0})
        }
        const checkSQL = `SELECT  * FROM category where c_ID = ?`
        const [checkResult] = await conn.query(checkSQL,[c_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({message : 'Unknown Category ID : ' + c_ID , status : 0})
        }
        const productSQL = `DELETE  FROM product WHERE c_ID = ? `
        const [productResult] = await conn.query(productSQL,[c_ID])
        const categorySQL = "DELETE FROM category WHERE c_ID = ?"
        const [categoryResult] = await conn.query(categorySQL ,[c_ID])
        if (categoryResult.affectedRows === 0) {
            return res.status(400).send({message : "Delete Category Unsuccessful" , status : 0})
        }
        return res.status(200).send({message : `Delete Product in Category ID : ${c_ID} AND Delete Category ID :  ${c_ID}` , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : "Something Went Wrong" , status : 0})
    }
}