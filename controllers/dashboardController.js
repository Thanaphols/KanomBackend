//dashboardController
const conn = require('../db')

exports.CountProduct = async (req, res) => {
    try {
        const countProductSQL = 'SELECT count(p_Name) AS totalProduct FROM product'
        const countCustomerSQL = 'SELECT count(u_userName) AS users FROM users WHERE u_role = 0'
        const countTotalOrderSQL = 'SELECT count(o_id) AS allOrder FROM orders'
        const countUnsuccessOrderSQL = 'SELECT count(o_id) AS unsuccessOrder FROM orders WHERE o_Status = 0'
        const countSuccessOrderSQL = 'SELECT count(o_id) AS successOrder FROM orders WHERE o_Status = 1'
        const productSQL = 'SELECT p_Name AS productName ,p_Price AS productPrice FROM product ORDER BY p_ID DESC'
        
        const customerPriceSQL = `SELECT users.u_userName AS customerName,
                                SUM(ordersitems.i_Amount * product.p_Price) AS customerTotal FROM users 
                                JOIN orders ON users.u_ID = orders.u_ID
                                JOIN ordersitems ON orders.o_ID = ordersitems.o_ID
                                JOIN product ON ordersitems.p_ID = product.p_ID
                                WHERE orders.o_Status = 1  
                                GROUP BY users.u_ID, users.u_userName ORDER BY customerTotal DESC LIMIT 5`

        const todaySalesSQL = `
                SELECT IFNULL(SUM(ordersitems.i_Amount * product.p_Price), 0) AS todayTotal 
                FROM orders JOIN ordersitems ON orders.o_ID = ordersitems.o_ID
                JOIN product ON ordersitems.p_ID = product.p_ID
                WHERE orders.o_Status = 1 AND DATE(orders.o_Date) = CURDATE()
        `;

        const chartTodaySQL = `
            SELECT DATE_FORMAT(orders.o_Date, '%H:00') AS label, SUM(ordersitems.i_Amount * product.p_Price) AS total
            FROM orders JOIN ordersitems ON orders.o_ID = ordersitems.o_ID JOIN product ON ordersitems.p_ID = product.p_ID
            WHERE orders.o_Status = 1 AND DATE(orders.o_Date) = CURDATE() GROUP BY label ORDER BY label ASC
        `;
        const chartWeekSQL = `
            SELECT DATE_FORMAT(orders.o_Date, '%a') AS label, SUM(ordersitems.i_Amount * product.p_Price) AS total
            FROM orders JOIN ordersitems ON orders.o_ID = ordersitems.o_ID JOIN product ON ordersitems.p_ID = product.p_ID
            WHERE orders.o_Status = 1 AND orders.o_Date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY label, DATE(orders.o_Date) ORDER BY DATE(orders.o_Date) ASC 
        `;
        const chartMonthSQL = `
            SELECT DATE_FORMAT(orders.o_Date, '%d %b') AS label, SUM(ordersitems.i_Amount * product.p_Price) AS total
            FROM orders JOIN ordersitems ON orders.o_ID = ordersitems.o_ID JOIN product ON ordersitems.p_ID = product.p_ID
            WHERE orders.o_Status = 1 AND orders.o_Date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY label, DATE(orders.o_Date) ORDER BY DATE(orders.o_Date) ASC
        `;
        const chartYearSQL = `
            SELECT DATE_FORMAT(orders.o_Date, '%b') AS label, SUM(ordersitems.i_Amount * product.p_Price) AS total
            FROM orders JOIN ordersitems ON orders.o_ID = ordersitems.o_ID JOIN product ON ordersitems.p_ID = product.p_ID
            WHERE orders.o_Status = 1 AND orders.o_Date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) GROUP BY label, YEAR(orders.o_Date), MONTH(orders.o_Date) ORDER BY YEAR(orders.o_Date) ASC, MONTH(orders.o_Date) ASC
        `;

        const [
            productResult, customerResult, totalOrderResult,
            unsuccessOrderResult, successOrderResult, productAll, customerData, todaySalesResult,
            chartTodayResult, chartWeekResult, chartMonthResult, chartYearResult
        ] = await Promise.all([
            conn.query(countProductSQL), conn.query(countCustomerSQL), conn.query(countTotalOrderSQL),
            conn.query(countUnsuccessOrderSQL), conn.query(countSuccessOrderSQL), conn.query(productSQL),
            conn.query(customerPriceSQL), conn.query(todaySalesSQL),
            conn.query(chartTodaySQL), conn.query(chartWeekSQL), conn.query(chartMonthSQL), conn.query(chartYearSQL)
        ]);

        const data = {
            totalProduct: productResult[0][0].totalProduct || 0,
            users: customerResult[0][0].users || 0,
            total: totalOrderResult[0][0].allOrder || 0,
            unsuccess: unsuccessOrderResult[0][0].unsuccessOrder || 0,
            success: successOrderResult[0][0].successOrder || 0,
            product: productAll[0],
            customer: customerData[0],
            todaySales: todaySalesResult[0][0].todayTotal || 0,
            // ส่งข้อมูล Chart ไป 4 ชุด
            charts: {
                today: chartTodayResult[0],
                week: chartWeekResult[0],
                month: chartMonthResult[0],
                year: chartYearResult[0]
            }
        };

        return res.status(200).send({ message: 'CountProduct Success', data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Something Went Wrong', status: 0 })
    }
}