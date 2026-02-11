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

        const [userData] = await conn.query("SELECT u_line_id, u_userName FROM users WHERE u_ID = ?", [u_ID]);
        const user = userData[0];

        await conn.query('START TRANSACTION');

       
        const orderSQL = `INSERT INTO orders ( u_ID, addr_ID, o_date, o_endDate, o_Status ) VALUES ( ?, ?, CURRENT_TIMESTAMP, NULL, 0 ) `;
        const [orderResult] = await conn.query(orderSQL, [u_ID, addr_ID]);
        const o_ID = orderResult.insertId;

        let totalPrice = 0;
        let itemsSummary = "";

        for (const item of cart) {
            const [product] = await conn.query("SELECT p_Name, p_Price FROM product WHERE p_ID = ?", [item.p_ID]);
            const p = product[0];

            const orderItemSQL = `INSERT INTO ordersitems (o_ID, p_ID, i_Amount) VALUES (?, ?, ?) `;
            await conn.query(orderItemSQL, [o_ID, item.p_ID, item.i_Amount]);

            totalPrice += p.p_Price * item.i_Amount;
            itemsSummary += `${p.p_Name} (x${item.i_Amount}), `;
        }

        await conn.query('COMMIT');

        if (user && user.u_line_id) {
            await LineService.sendOrderConfirmation(user.u_line_id, {
                userName: user.u_userName,
                itemsSummary: itemsSummary.slice(0, -2),
                totalPrice: totalPrice
            });
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