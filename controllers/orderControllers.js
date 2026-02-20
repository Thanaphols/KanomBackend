//controllers/orderControllers.js
const conn = require('../db')
const LineService = require('../services/lineService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: './uploads/slips', // อย่าลืมสร้าง Folder นี้ในโปรเจกต์ด้วยนะครับ
    filename: (req, file, cb) => {
        cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage: storage }).single('slip');
exports.getallOrder = async (req, res) => {
    try {
        const orderSQL = `
            SELECT 
                orders.o_ID, 
                orders.o_date, 
                orders.o_endDate, 
                orders.o_Status, 
                orders.is_deleted,
                users.u_userName, 
                users.u_tel,
                addresses.addr_Detail, 
                addresses.latitude,    
                addresses.longitude
            FROM orders 
            INNER JOIN users ON users.u_ID = orders.u_ID
            LEFT JOIN addresses ON orders.addr_ID = addresses.addr_ID
            ORDER BY orders.o_ID DESC
        `;
        const [orderResult] = await conn.query(orderSQL);
        return res.status(200).send({ data: orderResult, status: 1 });
    } catch (error) {
        console.error("Get All Orders Error:", error);
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
    const { o_ID } = req.params;
    try {
        if (!o_ID) {
            return res.status(400).send({
                message: "Please provide Order ID (o_ID)",
                status: 0
            });
        }
        const sql = `
            SELECT 
                o.*, 
                u.u_userName, 
                u.u_tel,
                a.addr_Name,
                a.addr_Detail,
                a.latitude,
                a.longitude
            FROM orders o 
            JOIN users u ON o.u_ID = u.u_ID
            LEFT JOIN addresses a ON o.addr_ID = a.addr_ID
            WHERE o.o_ID = ?
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
    // const { cart, o_endDate, u_ID } = req.body;
    // const io = req.app.get('io');
    // try {
    //     if (!u_ID || !o_endDate) {
    //         return res.status(400).send({ message: `User ID is Missing`, status: 0 });
    //     }

    //     const [settings] = await conn.query("SELECT s_value, start_date, end_date FROM system_settings WHERE s_key = 1");
    //     const settingsData = settings[0];
    //     console.log("1. SettingsจากDB:", settingsData);
    //     const depositPercent = settingsData ? parseInt(settingsData.s_value) : 50;
    //     const dbStart = settingsData?.start_date;
    //     const dbEnd = settingsData?.end_date;

    //     let isInPeriod = false;
    //     if (dbStart && dbEnd) {
    //         const now = new Date();
    //         const start = new Date(dbStart);
    //         const end = new Date(dbEnd);

    //         start.setHours(0, 0, 0, 0);
    //         end.setHours(23, 59, 59, 999);

    //         isInPeriod = now >= start && now <= end;
    //         console.log("Check Deposit Period:", { isInPeriod, start, end, now });
    //         console.log("2. ตรวจสอบเงื่อนไขวันที่:", {
    //             isInPeriod: isInPeriod,
    //             currentTime: now.toLocaleString(),
    //             startTime: start.toLocaleString(),
    //             endTime: end.toLocaleString()
    //         });
    //     }

    //     const o_is_deposit_required = isInPeriod ? 1 : 0;
    //     const o_deposit_status = isInPeriod ? 1 : 0;

    //     const orderSQL = `INSERT INTO orders (u_ID, o_date, o_endDate, o_is_deposit_required, o_deposit_status) VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)`;
    //     const [orderResult] = await conn.query(orderSQL, [u_ID, o_endDate, o_is_deposit_required, o_deposit_status]);

    //     const o_ID = orderResult.insertId;
    //     let totalPrice = 0;

    //     for (const item of cart) {
    //         const [product] = await conn.query("SELECT p_Price FROM product WHERE p_ID = ?", [item.p_ID]);
    //         const price = product[0]?.p_Price || 0;

    //         const orderItemSQL = `INSERT INTO ordersitems (o_ID, p_ID, i_Amount) VALUE (?,?,?)`;
    //         await conn.query(orderItemSQL, [o_ID, item.p_ID, item.i_Amount]);

    //         totalPrice += (price * item.i_Amount);
    //     }
    //     console.log("3. ราคาสุทธิ (totalPrice):", totalPrice);
    //     if (isInPeriod) {
    //         const depositAmount = totalPrice * (depositPercent / 100);
    //         console.log("4. ยอดมัดจำที่คำนวณได้:", depositAmount);
    //         await conn.query("UPDATE orders SET o_deposit_amount = ? WHERE o_ID = ?", [depositAmount, o_ID]);

    //         const [user] = await conn.query("SELECT u_line_id FROM users WHERE u_ID = ?", [u_ID]);
    //         if (user[0]?.u_line_id) {
    //             await LineService.sendDepositRequest(user[0].u_line_id, {
    //                 o_ID: o_ID,
    //                 amount: depositAmount
    //             });
    //         }
    //     } else {
    //         console.log("5. ระบบข้ามการมัดจำเพราะ isInPeriod เป็น false");
    //     }

    //     io.emit('refreshOrders');
    //     return res.status(201).send({ message: `Order Success`, status: 1 });
    // } catch (error) {
    //     console.error("Add Order Error:", error);
    //     return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 });
    // }
};



exports.updateOrder = async (req, res) => {
    const { cart, o_ID, o_endDate, o_is_deposit_required, o_deposit_status } = req.body;
    const io = req.app.get('io');

    let depositAmount = 0;

    try {
        // --- 1. ดึงค่า Config ทั้งหมด (Percent, Start, End) ---
        const [settings] = await conn.query("SELECT s_key, s_value FROM system_settings");
        const config = settings.reduce((acc, row) => ({ ...acc, [row.s_key]: row.s_value }), {});

        const depositPercent = config.deposit_percent ? parseInt(config.deposit_percent) : 50;
        const depositMultiplier = depositPercent / 100;
        const startDate = config.deposit_start_date ? new Date(config.deposit_start_date) : null;
        const endDate = config.deposit_end_date ? new Date(config.deposit_end_date) : null;

        // --- 2. เช็คว่าออเดอร์นี้ "ต้องมัดจำ" หรือไม่ ---
        // ดึงวันที่สร้างออเดอร์มาเช็คกับช่วงเวลาที่ตั้งไว้
        const [orderData] = await conn.query("SELECT o_date FROM orders WHERE o_ID = ?", [o_ID]);
        const orderDate = new Date(orderData[0].o_date);

        // เงื่อนไข: อยู่ในช่วงวันที่กำหนดหรือไม่?
        const isInPeriod = startDate && endDate && orderDate >= startDate && orderDate <= endDate;

        // สรุปนโยบาย: ถ้าแอดมินสั่งเปิด OR วันที่อยู่ในช่วงพิเศษ = ต้องมัดจำ
        const mustDeposit = o_is_deposit_required === 1 || isInPeriod;

        const isSkippingDeposit = !mustDeposit; // ถ้าไม่เข้าเงื่อนไขมัดจำเลย
        const isDepositFinished = o_deposit_status === 3;

        if ((!mustDeposit || isDepositFinished) && !o_endDate) {
            return res.status(400).send({ message: `กรุณากำหนดวันจัดส่งสินค้า`, status: 0 });
        }

        await conn.query('START TRANSACTION');

        // ... (ส่วนอัปเดต cart เหมือนเดิมของพี่) ...
        if (cart && cart.length > 0) {
            for (const item of cart) {
                const orderItemSQL = `UPDATE ordersitems SET i_Amount = ? WHERE i_ID = ? `;
                await conn.query(orderItemSQL, [item.i_Amount, item.i_ID]);
            }
        }

        const updateFields = [];
        const updateValues = [];

        if (o_endDate) {
            updateFields.push("o_endDate = ?");
            updateValues.push(o_endDate);
        }

        // --- 3. จัดการสถานะและยอดมัดจำ ---
        if (mustDeposit) {
            // บังคับลงฟิลด์นโยบายเป็น 1 (เพื่อให้หน้าบ้านรู้ว่าต้องมัดจำ)
            updateFields.push("o_is_deposit_required = ?");
            updateValues.push(1);

            const [totalData] = await conn.query(
                "SELECT SUM(i_Amount * 100) as total FROM ordersitems WHERE o_ID = ?", [o_ID]
            );

            depositAmount = (totalData[0].total || 0) * depositMultiplier;

            updateFields.push("o_deposit_amount = ?");
            updateValues.push(depositAmount);

            const currentStatus = o_deposit_status !== undefined ? Number(o_deposit_status) : 0;
            if (currentStatus === 0) {
                updateFields.push("o_deposit_status = ?");
                updateValues.push(1);
            }
        } else {
            // ถ้าไม่อยู่ในช่วงเวลา และแอดมินก็ไม่สั่งมัดจำ -> เคลียร์เป็น 0
            updateFields.push("o_is_deposit_required = ?", "o_deposit_status = ?", "o_deposit_amount = ?");
            updateValues.push(0, 0, 0);
        }

        updateValues.push(o_ID);
        const orderSQL = `UPDATE orders SET ${updateFields.join(", ")} WHERE o_ID = ?`;
        await conn.query(orderSQL, updateValues);

        await conn.query('COMMIT');

        // --- 4. ส่ง LINE (เหมือนเดิม แต่ใช้ตัวแปร mustDeposit แทน) ---
        const [orderInfo] = await conn.query(`
            SELECT u.u_line_id FROM orders o 
            JOIN users u ON o.u_ID = u.u_ID WHERE o.o_ID = ?
        `, [o_ID]);

        const customer = orderInfo[0];
        if (customer && customer.u_line_id) {
            if (mustDeposit && o_deposit_status === 1) {
                await LineService.sendDepositRequest(customer.u_line_id, {
                    o_ID: o_ID,
                    amount: depositAmount
                });
            } else if (o_endDate) {
                await LineService.sendDeliveryUpdate(customer.u_line_id, {
                    o_ID: o_ID,
                    o_endDate: new Date(o_endDate).toLocaleDateString('th-TH', {
                        year: 'numeric', month: 'long', day: 'numeric'
                    })
                });
            }
        }

        io.emit('refreshOrders');
        return res.status(201).send({ message: `อัปเดตข้อมูลออเดอร์เรียบร้อย`, status: 1 });

    } catch (error) {
        await conn.query('ROLLBACK');
        console.error(error);
        return res.status(500).send({ message: `เกิดข้อผิดพลาด`, status: 0 });
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
            SELECT o.o_ID, o.o_date, o.o_endDate, o.o_Status, 
                   o.o_deposit_status, o.o_deposit_amount, o.is_deleted,
                   p.p_Name, p.p_Img, p.p_Price, i.i_Amount, p.p_ID
            FROM orders o
            JOIN ordersitems i ON o.o_ID = i.o_ID
            JOIN product p ON i.p_ID = p.p_ID
            WHERE o.u_ID = ? 
            ORDER BY o.o_date DESC
        `;
        const [results] = await conn.query(sql, [u_ID]);
        res.status(200).json({ status: 1, data: results });
    } catch (error) {
        console.error(error);
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

exports.restoreOrder = async (req, res) => {
    const { o_ID } = req.params;
    const io = req.app.get('io');

    try {
        const [result] = await conn.query(
            "UPDATE orders SET is_deleted = 0 WHERE o_ID = ?",
            [o_ID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "ไม่พบออเดอร์", status: 0 });
        }

        io.emit('refreshOrders');
        return res.status(200).json({ message: "กู้คืนออเดอร์สำเร็จ", status: 1 });
    } catch (error) {
        res.status(500).json({ status: 0, message: "Server Error" });
    }
};

exports.verifyDeposit = async (req, res) => {
    const { o_ID } = req.body;
    const io = req.app.get('io');

    try {
        await conn.query(
            "UPDATE orders SET o_deposit_status = 3 WHERE o_ID = ?",
            [o_ID]
        );

        io.emit('refreshOrders');
        return res.status(200).json({ message: "ยืนยันมัดจำสำเร็จ", status: 1 });
    } catch (error) {
        return res.status(500).json({ message: "Error", status: 0 });
    }
};

exports.rejectDeposit = async (req, res) => {
    const { o_ID } = req.body;
    const io = req.app.get('io');

    try {
        const [order] = await conn.query("SELECT o_deposit_slip FROM orders WHERE o_ID = ?", [o_ID]);

        if (order.length > 0 && order[0].o_deposit_slip) {
            const filePath = path.join(__dirname, '..', 'uploads', 'slips', order[0].o_deposit_slip);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await conn.query(
            "UPDATE orders SET o_deposit_status = 1, o_deposit_slip = NULL WHERE o_ID = ?",
            [o_ID]
        );
        const [orderInfo] = await conn.query(`
    SELECT u.u_line_id, o.o_deposit_amount 
    FROM orders o JOIN users u ON o.u_ID = u.u_ID 
    WHERE o.o_ID = ?`, [o_ID]);

        if (orderInfo[0]?.u_line_id) {
            await LineService.sendDepositRequest(orderInfo[0].u_line_id, {
                o_ID: o_ID,
                amount: orderInfo[0].o_deposit_amount,
                isReject: true
            });
        }
        io.emit('refreshOrders');
        res.status(200).json({ status: 1, message: "ปฏิเสธสลิปและลบรูปภาพเรียบร้อย" });
    } catch (error) {
        console.error("Reject Error Detail:", error);
        res.status(500).json({ status: 0, message: "Reject Error" });
    }

};

exports.uploadSlip = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).json({ status: 0, message: "Upload Error" });

        const { o_ID } = req.body;
        const slipImage = req.file.filename;

        try {
            // อัปเดตชื่อไฟล์รูปสลิป และเปลี่ยนสถานะมัดจำเป็น 2 (รอตรวจสอบ)
            const sql = `UPDATE orders SET o_deposit_slip = ?, o_deposit_status = 2 WHERE o_ID = ?`;
            await conn.query(sql, [slipImage, o_ID]);

            res.status(200).json({ status: 1, message: "อัปโหลดสำเร็จ" });
        } catch (error) {
            res.status(500).json({ status: 0, message: "Database Error" });
        }
    });
};

