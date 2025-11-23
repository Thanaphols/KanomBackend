const conn = require('../db')

exports.getallOrder = async (req, res)=>{
    try {
        const orderSQL = `SELECT orders.o_ID,orders.o_date,orders.o_endDate ,orders.o_image,orders.o_Status,
        users.u_userName,
        usersdetail.de_tel 
        FROM orders INNER JOIN users ON users.u_ID = orders.u_ID
        INNER JOIN usersdetail ON usersdetail.u_ID = orders.u_ID ORDER BY orders.o_ID ASC
        `
        const [orderResult] = await conn.query(orderSQL)
        const data = orderResult
        return res.status(200).send({message : "Select Order Data Successfully" , data , status : 1})
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message : "Somethings Went Wrong" , status : 0})
    }
}
exports.orderitems = async (req,res)=>{
    const {o_ID} = req.params
    try {
        if(!o_ID) {
            return res.status(400).send({message : `Order ID is Missing ` , status : 0})
        }
         const selectOrdersitemsSQL = `SELECT ordersitems.i_ID,ordersitems.i_Amount, product.p_ID,product.p_Name FROM ordersitems 
         INNER JOIN product ON product.p_ID = ordersitems.p_ID WHERE o_ID = ?`
            const [resultOrdersitems] = await conn.query(selectOrdersitemsSQL,[o_ID])
        if( resultOrdersitems.length === 0){
            return res.status(404).send({message : `No Items in Order ID ${o_ID}`, status : 0})
        }
        const data = resultOrdersitems
        return res.status(200).send({message : `Select Order Detail ID : ${o_ID} Successfully` ,data, status : 1})
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
         const selectSQL = `SELECT ordersitems.i_Amount, product.p_ID,product.p_Name FROM ordersitems 
         INNER JOIN product ON product.p_ID = ordersitems.p_ID WHERE o_ID = ?`
         const [resultOrdersitems] = await conn.query(selectOrdersitemsSQL,[o_ID])
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
    const {cart,o_endDate,u_ID} = req.body
    const io = req.app.get('io')
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
        io.emit('refreshOrders')
        return res.status(201).send({message : `Order Success` , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}



exports.updateOrder = async (req,res) => {
    const {cart,o_ID,o_endDate} = req.body
    const io = req.app.get('io')
    try {
        if(!o_endDate) {
            return res.status(400).send({message : `User ID is Missing` , status : 0})
        }
        for ( const item of cart) {
            const orderItemSQL = `UPDATE ordersitems  SET i_Amount = ?  WHERE i_ID = ? `
            const [orderItemResult] = await conn.query(orderItemSQL,[item.i_Amount,item.i_ID])
            if (orderItemResult.affectedRows === 0) {
                return res.status(400).send({message : `Can't Update Order items` , status : 0})
            }
        }

        const orderSQL = `UPDATE orders  SET o_endDate = ?  WHERE o_ID = ? `
            const [orderResult] = await conn.query(orderSQL,[o_endDate,o_ID])
            if (orderResult.affectedRows === 0) {
                return res.status(400).send({message : `Can't Update Order ` , status : 0})
        }
        io.emit('refreshOrders')
        return res.status(201).send({message : `Update Order Items Successfully` , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}

exports.getdateEnd = async (req,res)=>{
    const {o_ID} = req.params
    try {
        if (!o_ID){
            return res.status(400).send({message : `Order ID is Missing`, status : 0})
        }
        const selectdateEndSQL = 'SELECT o_endDate,o_ID FROM orders WHERE o_ID = ?'
        const [resultdateEnd] = await conn.query(selectdateEndSQL,[o_ID])
        if(resultdateEnd.length === 0){
            return res.status(404).send({message: `Unknow Order ID : ${o_ID} `, status : 0})
        }
        const  data = resultdateEnd 
        return  res.status(200).send({message : `Select success Order ID ${o_ID}`,data, status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}

exports.updateStatusOrder = async (req,res)=>{
    const {o_ID} = req.body
    const io = req.app.get('io')
    try {
        const updateStatusSQL = `UPDATE orders SET o_Status = ? WHERE o_ID = ?`
        const [updateStatusResult] = await conn.query(updateStatusSQL,[1,o_ID])
        if (updateStatusResult.affectedRows === 0){
            return res.status(400).send({message: `Can't Update Status Order ID ${o_ID}`, status : 0})
        }
        io.emit('refreshOrders')
        return  res.status(200).send({message : `Update Order ID ${o_ID}` , status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}

exports.deleteOrders = async (req,res)=>{
     const {o_ID} = req.params
     const io =req.app.get('io')
    try {
      console.log(o_ID)
      if(!o_ID) {
        return res.status(400).send({message : `Order ID is Missing`, status : 0})
      }
      const deleteOrderItemSQL = `DELETE FROM ordersitems WHERE o_ID = ?`
      const [resultdeleteOrderItem] = await conn.query(deleteOrderItemSQL,[o_ID])
      
      const deleteOrderSQL = `DELETE FROM orders WHERE o_ID = ?`
      const [resultdeleteOrder] = await conn.query(deleteOrderSQL,[o_ID])
      if (resultdeleteOrder.affectedRows === 0) {
        return res.status(404).send({message: `Delete Order ID : ${o_ID} Unsuccessfully`, status : 0})
      } 
      io.emit('refreshOrders')
      return res.status(200).send({message : `Delete Order ID : ${o_ID} Successfully`, status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}


exports.sumPrice = async(req,res)=>{
    const {o_ID} = req.params
    let sum = 0
    try {
        if(!o_ID) {
            return res.status(400).send({message: `Order ID is Missing`, status: 0})
        }
        const selectItemAmountSQL= `SELECT product.p_Price,ordersitems.p_ID,ordersitems.i_Amount FROM ordersitems 
                                    INNER JOIN product ON product.p_ID = ordersitems.p_ID WHERE o_ID = ?`
        const [selectItemAmount] = await conn.query(selectItemAmountSQL,[o_ID])
        for (const item of selectItemAmount){
            sum += item.p_Price * item.i_Amount
            // console.log(`p_ID : ${item.p_ID}  price : ${item.p_Price}  Amount : ${item.i_Amount}`)
        }
        const data = sum
        return res.status(200).send({message : `Sum success`, data ,status : 1})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message : `Somethings Went Wrong` , status : 0})
    }
}