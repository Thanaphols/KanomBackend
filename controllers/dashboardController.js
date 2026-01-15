const conn = require('../db')

exports.CountProduct = async (req, res) => {
    try {
        const countProductSQL = 'SELECT count(p_Name) AS totalProduct FROM product'
        const countCustomerSQL = 'SELECT count(u_userName) AS users FROM users WHERE u_role != ?'
        const countTotalOrderSQL = 'SELECT count(o_id) AS allOrder FROM orders'
        const countUnsuccessOrderSQL = 'SELECT count(o_id) AS unsuccessOrder FROM orders WHERE o_Status = ?'
        const countSuccessOrderSQL = 'SELECT count(o_id) AS successOrder FROM orders WHERE o_Status = 1'
        const productSQL = 'SELECT p_Name AS productName ,p_Price AS productPrice FROM product ORDER BY p_ID DESC'
        const customerPriceSQL = `SELECT users.u_userName AS customerName,
                                SUM(ordersitems.i_Amount * product.p_Price) AS customerTotal FROM users 
                                JOIN orders ON users.u_ID = orders.u_ID
                                JOIN ordersItems ON orders.o_ID = ordersitems.o_ID
                                JOIN product ON ordersitems.p_ID = product.p_ID
                                WHERE orders.o_Status = 1  
                                GROUP BY users.u_ID, users.u_userName ORDER BY customerTotal DESC LIMIT 5`

        const weeklySalesSQL = `
            SELECT 
                DATE_FORMAT(orders.o_Date, '%a') AS label, 
                SUM(ordersitems.i_Amount * product.p_Price) AS total
                FROM orders
                JOIN ordersItems ON orders.o_ID = ordersitems.o_ID
                JOIN product ON ordersitems.p_ID = product.p_ID
                WHERE orders.o_Status = 1 
                AND orders.o_Date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY label, DATE(orders.o_Date) 
                ORDER BY DATE(orders.o_Date) ASC 
        `;

        const monthlySalesSQL = `
            SELECT 
                DATE_FORMAT(orders.o_Date, '%b') AS label, 
                SUM(ordersitems.i_Amount * product.p_Price) AS total
                FROM orders
                JOIN ordersItems ON orders.o_ID = ordersitems.o_ID
                JOIN product ON ordersitems.p_ID = product.p_ID
                WHERE orders.o_Status = 1 
                AND orders.o_Date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                GROUP BY label, YEAR(orders.o_Date), MONTH(orders.o_Date)
                ORDER BY YEAR(orders.o_Date) ASC, MONTH(orders.o_Date) ASC
        `;
        const todaySalesSQL = `
            SELECT SUM(ordersitems.i_Amount * product.p_Price) AS todayTotal 
                FROM orders
                JOIN ordersItems ON orders.o_ID = ordersitems.o_ID
                JOIN product ON ordersitems.p_ID = product.p_ID
                WHERE orders.o_Status = 1 
                AND DATE(orders.o_Date) = CURDATE()
        `;

        const [
            productResult, customerResult, totalOrderResult,
            unsuccessOrderResult, successOrderResult,
            productAll, customerData,
            weeklySalesResult, monthlySalesResult, todaySalesResult

        ] = await Promise.all([
            conn.query(countProductSQL),
            conn.query(countCustomerSQL, [1]),
            conn.query(countTotalOrderSQL),
            conn.query(countUnsuccessOrderSQL, [0]),
            conn.query(countSuccessOrderSQL, [1]),
            conn.query(productSQL),
            conn.query(customerPriceSQL),
            conn.query(weeklySalesSQL),
            conn.query(monthlySalesSQL),
            conn.query(todaySalesSQL)
        ]);

        const data = {
            totalProduct: productResult[0][0].totalProduct || 0,
            users: customerResult[0][0].users || 0,
            total: totalOrderResult[0][0].allOrder || 0,
            unsuccess: unsuccessOrderResult[0][0].unsuccessOrder || 0,
            success: successOrderResult[0][0].successOrder || 0,
            product: productAll[0],
            customer: customerData[0],
            weeklySales: weeklySalesResult[0],
            monthlySales: monthlySalesResult[0],
            todaySales: todaySalesResult[0][0].todayTotal || 0
        };

        return res.status(200).send({ message: 'CountProduct Success', data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Something Went Wrong', status: 0 })
    }
}