//controllers/orderControllers.js
const conn = require('../db')
const LineService = require('../services/lineService');
exports.getallOrder = async (req, res) => {
    try {
        const orderSQL = `
            SELECT orders.o_ID, orders.o_date, orders.o_endDate, orders.o_Status, orders.is_deleted,
            users.u_userName, users.u_tel 
            FROM orders 
            INNER JOIN users ON users.u_ID = orders.u_ID
            ORDER BY orders.o_ID DESC
        `;
        const [orderResult] = await conn.query(orderSQL);
        return res.status(200).send({ data: orderResult, status: 1 });
    } catch (error) {
        res.status(500).send({ status: 0 });
    }
};
exports.orderitems = async (req, res) => {
    const { o_ID } = req.params
    try {
        if (!o_ID) {
            return res.status(400).send({ message: `Order ID is Missing `, status: 0 })
        }
        const selectOrdersitemsSQL = `SELECT ordersitems.i_ID,ordersitems.i_Amount, product.p_ID,product.p_Name FROM ordersitems 
         INNER JOIN product ON product.p_ID = ordersitems.p_ID WHERE o_ID = ?`
        const [resultOrdersitems] = await conn.query(selectOrdersitemsSQL, [o_ID])
        if (resultOrdersitems.length === 0) {
            return res.status(404).send({ message: `No Items in Order ID ${o_ID}`, status: 0 })
        }
        const data = resultOrdersitems
        return res.status(200).send({ message: `Select Order Detail ID : ${o_ID} Successfully`, data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "Somethings Went Wrong", status: 0 })
    }
}
exports.orderDetail = async (req, res) => {
    const { o_ID } = req.params
    try {
        if (!o_ID) {
            return res.status(400).send({ message: `Order ID is Missing `, status: 0 })
        }
        const selectSQL = `SELECT ordersitems.i_Amount, product.p_ID,product.p_Name FROM ordersitems 
         INNER JOIN product ON product.p_ID = ordersitems.p_ID WHERE o_ID = ?`
        const [resultOrdersitems] = await conn.query(selectOrdersitemsSQL, [o_ID])
        return res.status(200).send({ message: `Select Order Detail ID : ${o_ID} Successfully`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "Somethings Went Wrong", status: 0 })
    }
}


exports.getOrderID = async (req, res) => {
    const { o_ID } = req.params
    try {
        if (!o_ID) {
            return res.status(400).send({
                message: "Please provide Order ID (o_ID)",
                status: 0
            });
        }
        const sql = ` SELECT  o.*,u.u_userName,  u.u_tel         
            FROM orders o JOIN users u ON o.u_ID = u.u_ID
            WHERE  o.o_ID = ?
        `;
        const [result] = await conn.query(sql, [o_ID]);
        if (result.length === 0) {
            return res.status(404).send({
                message: `Order ID ${o_ID} not found`,
                status: 0
            });
        }
        return res.status(200).send({
            message: "Get Order Detail Success",
            data: result[0],
            status: 1
        });
    } catch (error) {
        console.error("Get Order Error:", error);
        return res.status(500).send({
            message: "Something Went Wrong",
            status: 0
        });
    }
}

exports.addOrder = async (req, res) => {
    const { cart, o_endDate, u_ID } = req.body
    const io = req.app.get('io')
    try {
        if (!u_ID || !o_endDate) {
            return res.status(400).send({ message: `User ID is Missing`, status: 0 })
        }
        const orderSQL = `INSERT INTO orders ( u_ID,o_date,o_endDate ) VALUE ( ?, CURRENT_TIMESTAMP,? ) `
        const [orderResult] = await conn.query(orderSQL, [u_ID, o_endDate])
        if (orderResult.affectedRows === 0) {
            return res.stats(400).send({ message: `Can't Insert Order `, status: 0 })
        }
        const o_ID = orderResult.insertId
        for (const item of cart) {
            const orderItemSQL = `INSERT INTO ordersitems (o_ID,p_ID,i_Amount ) VALUE (?,?,?) `
            const [orderItemResult] = await conn.query(orderItemSQL, [o_ID, item.p_ID, item.i_Amount, item.p_Price])
            if (orderItemResult.affectedRows === 0) {
                return res.status(400).send({ message: `Can't Insert Order items`, status: 0 })
            }
        }

        const itemsSummary = cartItems.map(item => `${item.p_Name} x${item.i_Amount}`).join(', ');

        const lineResult = await LineService.sendOrderConfirmation(u_line_id, {
            userName: u_userName,
            itemsSummary: itemsSummary,
            totalPrice: totalPrice
        });

        if (lineResult.success) {
            res.json({ status: 1, message: "บันทึกออเดอร์และส่ง LINE สำเร็จ" });
        } else {
            res.json({ status: 1, message: "บันทึกออเดอร์สำเร็จ (LINE ขัดข้อง)" });
        }

        io.emit('refreshOrders')
        return res.status(201).send({ message: `Order Success`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 })
    }
}



exports.updateOrder = async (req, res) => {
    const { cart, o_ID, o_endDate } = req.body;
    const io = req.app.get('io');

    try {
        if (!o_endDate) {
            return res.status(400).send({ message: `Delivery Date is Missing`, status: 0 });
        }

        await conn.query('START TRANSACTION');

        for (const item of cart) {
            const orderItemSQL = `UPDATE ordersitems SET i_Amount = ? WHERE i_ID = ? `;
            const [orderItemResult] = await conn.query(orderItemSQL, [item.i_Amount, item.i_ID]);
            if (orderItemResult.affectedRows === 0) {
                await conn.query('ROLLBACK');
                return res.status(400).send({ message: `Can't Update Order item ID: ${item.i_ID}`, status: 0 });
            }
        }

        const orderSQL = `UPDATE orders SET o_endDate = ? WHERE o_ID = ? `;
        const [orderResult] = await conn.query(orderSQL, [o_endDate, o_ID]);
        if (orderResult.affectedRows === 0) {
            await conn.query('ROLLBACK');
            return res.status(400).send({ message: `Can't Update Order ID: ${o_ID}`, status: 0 });
        }

        const [orderInfo] = await conn.query(`
            SELECT u.u_line_id 
            FROM orders o 
            JOIN users u ON o.u_ID = u.u_ID 
            WHERE o.o_ID = ?
        `, [o_ID]);

        await conn.query('COMMIT');

        const customer = orderInfo[0];
        if (customer && customer.u_line_id) {
            await LineService.sendDeliveryUpdate(customer.u_line_id, {
                o_ID: o_ID,
                o_endDate: new Date(o_endDate).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                })
            });
        }

        io.emit('refreshOrders');
        return res.status(201).send({ message: `Update Order Items Successfully`, status: 1 });

    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error);
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 });
    }
};

exports.getdateEnd = async (req, res) => {
    const { o_ID } = req.params
    try {
        if (!o_ID) {
            return res.status(400).send({ message: `Order ID is Missing`, status: 0 })
        }
        const selectdateEndSQL = 'SELECT o_endDate,o_ID FROM orders WHERE o_ID = ?'
        const [resultdateEnd] = await conn.query(selectdateEndSQL, [o_ID])
        if (resultdateEnd.length === 0) {
            return res.status(404).send({ message: `Unknow Order ID : ${o_ID} `, status: 0 })
        }
        const data = resultdateEnd
        return res.status(200).send({ message: `Select success Order ID ${o_ID}`, data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 })
    }
}

exports.updateStatusOrder = async (req, res) => {
    const { o_ID } = req.body
    const io = req.app.get('io')
    try {
        const updateStatusSQL = `UPDATE orders SET o_Status = ? WHERE o_ID = ?`
        const [updateStatusResult] = await conn.query(updateStatusSQL, [1, o_ID])

        if (updateStatusResult.affectedRows === 0) {
            return res.status(400).send({ message: `Can't Update Status Order ID ${o_ID}`, status: 0 })
        }

        const [orderInfo] = await conn.query(`
            SELECT u.u_line_id 
            FROM orders o 
            JOIN users u ON o.u_ID = u.u_ID 
            WHERE o.o_ID = ?
        `, [o_ID]);

        const customer = orderInfo[0];

        if (customer && customer.u_line_id) {
            await LineService.sendOrderSuccess(customer.u_line_id, o_ID);
        }

        io.emit('refreshOrders')
        return res.status(200).send({ message: `Update Order ID ${o_ID} Success`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 })
    }
}

exports.deleteOrders = async (req, res) => {
    const { o_ID } = req.params
    const io = req.app.get('io')
    try {
        console.log(o_ID)
        if (!o_ID) {
            return res.status(400).send({ message: `Order ID is Missing`, status: 0 })
        }
        const deleteOrderItemSQL = `DELETE FROM ordersitems WHERE o_ID = ?`
        const [resultdeleteOrderItem] = await conn.query(deleteOrderItemSQL, [o_ID])

        const deleteOrderSQL = `DELETE FROM orders WHERE o_ID = ?`
        const [resultdeleteOrder] = await conn.query(deleteOrderSQL, [o_ID])
        if (resultdeleteOrder.affectedRows === 0) {
            return res.status(404).send({ message: `Delete Order ID : ${o_ID} Unsuccessfully`, status: 0 })
        }
        io.emit('refreshOrders')
        return res.status(200).send({ message: `Delete Order ID : ${o_ID} Successfully`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 })
    }
}


exports.sumPrice = async (req, res) => {
    const { o_ID } = req.params
    let sum = 0
    try {
        if (!o_ID) {
            return res.status(400).send({ message: `Order ID is Missing`, status: 0 })
        }
        const selectItemAmountSQL = `SELECT product.p_Price,ordersitems.p_ID,ordersitems.i_Amount FROM ordersitems 
                                    INNER JOIN product ON product.p_ID = ordersitems.p_ID WHERE o_ID = ?`
        const [selectItemAmount] = await conn.query(selectItemAmountSQL, [o_ID])
        for (const item of selectItemAmount) {
            sum += item.p_Price * item.i_Amount
        }
        const data = sum
        return res.status(200).send({ message: `Sum success`, data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 })
    }
}


exports.getUserOrders = async (req, res) => {
    const u_ID = req.userData.u_ID;
    try {
        const sql = `
            SELECT o.o_ID, o.o_date, o.o_endDate, o.o_Status, o.o_image, 
                   p.p_Name, p.p_Img, p.p_Price, i.i_Amount
            FROM orders o
            JOIN ordersitems i ON o.o_ID = i.o_ID
            JOIN product p ON i.p_ID = p.p_ID
            WHERE o.u_ID = ? AND o.is_deleted = 0
            ORDER BY o.o_date DESC
        `;
        const [results] = await conn.query(sql, [u_ID]);
        res.status(200).json({ status: 1, data: results });
    } catch (error) {
        res.status(500).json({ status: 0, message: "Error" });
    }
};

exports.cancelOrder = async (req, res) => {
    const { o_ID } = req.params;
    const u_ID = req.userData.u_ID;
    const io = req.app.get('io');

    try {
        const [order] = await conn.query(
            "SELECT o_Status, is_deleted FROM orders WHERE o_ID = ? AND u_ID = ?",
            [o_ID, u_ID]
        );

        if (order.length === 0 || order[0].is_deleted === 1) {
            return res.status(404).json({ message: "ไม่พบออเดอร์", status: 0 });
        }

        if (order[0].o_Status !== 0) {
            return res.status(400).json({ message: "ไม่สามารถยกเลิกได้เนื่องจากร้านดำเนินการแล้ว", status: 0 });
        }

        await conn.query("UPDATE orders SET is_deleted = 1 WHERE o_ID = ?", [o_ID]);

        io.emit('refreshOrders');
        return res.status(200).json({ message: "ยกเลิกออเดอร์สำเร็จ", status: 1 });
    } catch (error) {
        res.status(500).json({ message: "Error", status: 0 });
    }
};

// เพิ่มใน controllers/orderControllers.js
exports.updateDepositPolicy = async (req, res) => {
    const { o_ID, isRequired } = req.body;
    const io = req.app.get('io');

    try {
        if (isRequired === 1) {
            const [orderItems] = await conn.query(
                "SELECT SUM(i.i_Amount * p.p_Price) as total FROM ordersitems i JOIN product p ON i.p_ID = p.p_ID WHERE i.o_ID = ?",
                [o_ID]
            );
            const depositAmount = orderItems[0].total / 2;

            await conn.query(
                "UPDATE orders SET o_is_deposit_required = 1, o_deposit_status = 1, o_deposit_amount = ? WHERE o_ID = ?",
                [depositAmount, o_ID]
            );

            console.log(`แจ้งลูกค้าออเดอร์ ${o_ID} ให้โอนมัดจำจำนวน ${depositAmount} บาท`);

        } else {

            await conn.query(
                "UPDATE orders SET o_is_deposit_required = 0, o_deposit_status = 0 WHERE o_ID = ?",
                [o_ID]
            );
        }

        io.emit('refreshOrders');
        return res.status(200).json({ message: "อัปเดตเงื่อนไขการมัดจำสำเร็จ", status: 1 });
    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาด", status: 0 });
    }
};