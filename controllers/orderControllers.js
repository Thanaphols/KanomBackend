const conn = require('../db')

exports.getallOrder = async (req, res)=>{
    try {
        const orderSQL = `SELECT orders.o_ID ,users.u_userName,usersdetail.de_tel,o_Status,o_image,ordersitems.i_Amount,ordersitems.i_Price,product.p_Name,product.p_Detail,product.p_Img, orders.o_date,orders.o_endDate,usersdetail.latitude,usersdetail.longitude FROM orders 
                        INNER JOIN ordersitems ON ordersitems.o_ID = orders.o_ID 
                        INNER JOIN product ON product.p_ID = ordersitems.p_ID
                        INNER JOIN users ON users.u_ID = orders.u_ID
                        INNER JOIN usersdetail ON users.u_ID = usersdetail.u_ID`
        const [orderResult] = await conn.query(orderSQL)
        if(orderResult.length === 0 ){
            return res.status(200).send({message : `No Orders Data` , status : 0})
        }
        const data = orderResult
        return res.status(200).send({message : "Select Order Data Successfully" , data , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message : "Somethings Went Wrong" , status : 0})
    }
}

exports.orderDetail = async (req,res)=>{
    const {o_ID} = req.param 
    try {
        if(!o_ID) {
            return res.status(400).send({message : `Order ID is Missing ` , status : 0})
        }
         const selectSQL = `SELECT orders.o_ID ,users.u_userName,usersdetail.de_tel,o_Status,o_image,ordersitems.i_Amount,ordersitems.i_Price,product.p_Name,product.p_Detail,product.p_Img, orders.o_date,orders.o_endDate,usersdetail.latitude,usersdetail.longitude FROM orders 
                        INNER JOIN ordersitems ON ordersitems.o_ID = orders.o_ID 
                        INNER JOIN product ON product.p_ID = ordersitems.p_ID
                        INNER JOIN users ON users.u_ID = orders.u_ID
                        INNER JOIN usersdetail ON users.u_ID = usersdetail.u_ID`

          return res.status(200).send({message : `Select Order Detail ID : ${o_ID} Successfully` , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message : "Somethings Went Wrong" , status : 0})
    }
}

exports.getOrderID= (req, res)=>{
    const id = req.body.o_id
    res.send("All order" + id)
}

exports.addOrder = async (req,res) => {
    try {
        // console.log(req.body.cart)
        const {cart,u_ID} = req.body
        if(!u_ID ) {
            return res.status(400).send({message : `User ID is Missing` , status : 0})
        }
        const orderSQL = `INSERT INTO orders ( u_ID,o_date ) VALUE ( ?, CURRENT_TIMESTAMP ) `
        const [orderResult] = await conn.query(orderSQL,[u_ID])
        if(orderResult.affectedRows === 0) {
            return res.stats(400).send({message : `Can't Insert Order ` , status : 0})
        }
        const o_ID = orderResult.insertId
        console.log(orderResult)
        for ( const item of cart) {
            const orderItemSQL = `INSERT INTO ordersitems (o_ID,p_ID,i_Amount,i_Price ) VALUE (?,?,?,?) `
            const [orderItemResult] = await conn.query(orderItemSQL,[o_ID,item.p_ID,item.p_Amount,item.p_Price])
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
