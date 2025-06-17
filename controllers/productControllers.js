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
    const [ id,name,detail,price,amount] = req.body
    if (!name || !detail  || !price  || !amount  || !id  ){
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

exports.getProductID =  async (req,res)=>{
     const id = req.params.p_id
     //console.log(id)
        try {
            if(!id ){
                return res.status(400).send({message : 'ID product is missing Please Try agina later'})
            }
            const SQL = "SELECT * FROM product WHERE p_ID = ?"
            const [result] = await conn.query(SQL,[id])
            if(result.length === 0){
               return res.status(409).send({message : "No pruduct ID "+id})
            }
            const data = result[0]
            return res.status(201).send({message : 'Select Product ID : '+id , data })
        } catch (error) {
           // console.log(error)
            return res.status(401).send({message : 'Something Wrongs'})
        }
}