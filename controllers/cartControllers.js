// KanomBackend/controllers/cartControllers.js
const conn = require('../db');
const LineService = require('../services/lineService');

exports.addCart = async (req, res) => {
    const { cart, addr_ID } = req.body;
    const u_ID = req.userData.u_ID;

    try {
        if (!u_ID) {
            return res.status(400).send({ message: `User ID is Missing`, status: 0 });
        }

        // 1. ดึงนโยบายมัดจำล่าสุดจาก Database (ID 1)
        const [settings] = await conn.query("SELECT s_value, start_date, end_date FROM system_settings WHERE s_key = 1");
        const config = settings[0];
        const depositPercent = config ? parseInt(config.s_value) : 50;

        // 2. เช็คช่วงเวลาพิเศษ (isInPeriod)
        let isInPeriod = false;
        if (config?.start_date && config?.end_date) {
            const now = new Date();
            const start = new Date(config.start_date);
            const end = new Date(config.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            isInPeriod = now >= start && now <= end;
        }

        // เตรียมสถานะมัดจำเบื้องต้น
        const o_is_deposit_required = isInPeriod ? 1 : 0;
        const o_deposit_status = isInPeriod ? 1 : 0;

        const [userData] = await conn.query("SELECT u_line_id, u_userName FROM users WHERE u_ID = ?", [u_ID]);
        const user = userData[0];

        await conn.query('START TRANSACTION');

        // 3. บันทึก Order หลัก (เพิ่มฟิลด์มัดจำเข้าไปด้วย)
        const orderSQL = `
            INSERT INTO orders (u_ID, addr_ID, o_date, o_endDate, o_Status, o_is_deposit_required, o_deposit_status) 
            VALUES (?, ?, CURRENT_TIMESTAMP, NULL, 0, ?, ?)
        `;
        const [orderResult] = await conn.query(orderSQL, [u_ID, addr_ID, o_is_deposit_required, o_deposit_status]);
        const o_ID = orderResult.insertId;

        let totalPrice = 0;
        let itemsSummary = "";

        // 4. บันทึกสินค้าและคำนวณยอดรวม
        for (const item of cart) {
            const [product] = await conn.query("SELECT p_Name, p_Price FROM product WHERE p_ID = ?", [item.p_ID]);
            const p = product[0];

            const orderItemSQL = `INSERT INTO ordersitems (o_ID, p_ID, i_Amount) VALUES (?, ?, ?) `;
            await conn.query(orderItemSQL, [o_ID, item.p_ID, item.i_Amount]);

            totalPrice += p.p_Price * item.i_Amount;
            itemsSummary += `${p.p_Name} (x${item.i_Amount}), `;
        }

        // 5. หากอยู่ในช่วงมัดจำ ให้คำนวณยอดและบันทึก o_deposit_amount
        let depositAmount = 0;
        if (isInPeriod) {
            depositAmount = totalPrice * (depositPercent / 100);
            await conn.query("UPDATE orders SET o_deposit_amount = ? WHERE o_ID = ?", [depositAmount, o_ID]);
        }

        await conn.query('COMMIT');

        // 6. การส่ง LINE (ส่งทั้งคอนเฟิร์มออเดอร์ และทวงมัดจำถ้ามี)
        if (user && user.u_line_id) {
            // ส่งยืนยันออเดอร์ปกติ
            await LineService.sendOrderConfirmation(user.u_line_id, {
                userName: user.u_userName,
                itemsSummary: itemsSummary.slice(0, -2),
                totalPrice: totalPrice
            });

            // 🚩 เพิ่ม: ถ้าต้องมัดจำ ให้ส่ง Flex Message ทวงเงินทันที
            if (isInPeriod && depositAmount > 0) {
                await LineService.sendDepositRequest(user.u_line_id, {
                    o_ID: o_ID,
                    amount: depositAmount
                });
            }

            await LineService.notifyAdminNewOrder({
                userName: user.u_userName,
                itemsSummary: itemsSummary,
                totalPrice: totalPrice
            });
        }

        return res.status(201).send({ message: `Order Success`, status: 1 });

    } catch (error) {
        await conn.query('ROLLBACK');
        console.log(error);
        return res.status(500).send({ message: `Somethings Went Wrong`, status: 0 });
    }
};