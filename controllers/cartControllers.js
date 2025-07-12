const conn = require('../db')
exports.addCart = async (req,res) => {
    const {cart,o_endDate} = req.body
    const u_ID = req.userData.u_ID
    try {
        if(!u_ID ||  !o_endDate) {
            return res.status(400).send({message : `User ID is Missing` , status : 0})
        }
        const orderSQL = `INSERT INTO orders ( u_ID,o_date,o_endDate ) VALUE ( ?, CURRENT_TIMESTAMP,? ) `
        const [orderResult] = await conn.query(orderSQL,[u_ID,o_endDate])
        if(orderResult.affectedRows === 0) {
            return res.stats(400).send({message : `Can't Insert Order ` , status : 0})
        }
        const o_ID = orderResult.insertId
        for ( const item of cart) {
            const orderItemSQL = `INSERT INTO ordersitems (o_ID,p_ID,i_Amount ) VALUE (?,?,?) `
            const [orderItemResult] = await conn.query(orderItemSQL,[o_ID,item.p_ID,item.i_Amount,item.p_Price])
            if (orderItemResult.affectedRows === 0) {
                return res.status(400).send({message : `Can't Insert Order items` , status : 0})
            }
        }
        return res.status(201).send({message : `Order Success` , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}