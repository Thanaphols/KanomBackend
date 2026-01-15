const conn = require('../db')
exports.getFinan = async (req,res)=>{
    try {
        // 1. ดึงข้อมูลรายจ่าย (Financials)
        // Join: financials -> financials_items -> costs
        const expenseSql = `
            SELECT 
                f.f_ID, f.f_Date, 
                fi.fi_ID, fi.fi_Amount, fi.fi_Price, 
                c.co_Name
            FROM financials f
            LEFT JOIN financials_items fi ON f.f_ID = fi.f_ID
            LEFT JOIN costs c ON fi.co_ID = c.co_ID 
            ORDER BY f.f_Date DESC
        `;
        const [expensesRaw] = await conn.query(expenseSql);

        // 2. ดึงข้อมูลรายรับ (Orders)
        // Join: orders -> ordersitems -> product
        // *สมมติว่าตาราง product มี p_Price ถ้าไม่มีต้องปรับแก้*
        const incomeSql = `
            SELECT o.o_ID, o.o_date, o.o_Status, oi.i_ID, oi.i_Amount, p.p_Name, p.p_Price
            FROM orders o
            LEFT JOIN ordersitems oi ON o.o_ID = oi.o_ID
            LEFT JOIN product p ON oi.p_ID = p.p_ID 
            WHERE o.o_Status = 1
            ORDER BY o.o_date DESC
        `;
        const [incomesRaw] = await conn.query(incomeSql);

        // Helper Function: แปลงวันที่เป็น พ.ศ. (dd/mm/yyyy)
        const formatDateThai = (date) => {
            if (!date) return "";
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear() + 543;
            return `${day}/${month}/${year}`;
        };

        // 3. จัดกลุ่มข้อมูลรายจ่าย (Expenses)
        const expenseMap = new Map();
        expensesRaw.forEach(row => {
            if (!expenseMap.has(row.f_ID)) {
                expenseMap.set(row.f_ID, {
                    id: row.f_ID,
                    type: 'รายจ่าย',
                    date: formatDateThai(row.f_Date),
                    rawDate: new Date(row.f_Date), // เก็บไว้สำหรับ sort รวม
                    amount: 0,
                    category: 'วัตถุดิบ', // Hardcode ตามตัวอย่าง หรือดึงจากตาราง costs ถ้ามี
                    details: '',
                    viewData: []
                });
            }
            
            const exp = expenseMap.get(row.f_ID);
            
            // เพิ่มรายการย่อย
            if (row.fi_ID) {
                const itemTotal = parseFloat(row.fi_Price) || 0; // สมมติ fi_Price เป็นราคารวมของ item นั้น
                exp.amount += itemTotal;
                
                exp.viewData.push({
                    label: row.co_Name || 'ไม่ระบุ',
                    amount: itemTotal,
                    qty: parseFloat(row.fi_Amount) || 0,
                    type: 'วัตถุดิบ'
                });

                // สร้าง details (เอาชื่อรายการแรกมาโชว์ + ... ถ้ามีหลายรายการ)
                if (exp.viewData.length === 1) {
                    exp.details = `ซื้อ${row.co_Name}`;
                } else if (exp.viewData.length === 2) {
                    exp.details += ' และอื่นๆ';
                }
            }
        });
        const incomeMap = new Map();
        incomesRaw.forEach(row => {
            if (!incomeMap.has(row.o_ID)) {
                incomeMap.set(row.o_ID, {
                    id: `${row.o_ID}`, // Format O001
                    type: 'รายรับ', // หรือ 'คำสั่งซื้อ'
                    date: formatDateThai(row.o_date),
                    rawDate: new Date(row.o_date),
                    amount: 0,
                    category: 'ขายสินค้า',
                    details: '',
                    viewData: []
                });
            }
            const inc = incomeMap.get(row.o_ID);
            if (row.i_ID) {
                const qty = parseFloat(row.i_Amount) || 0;
                const price = parseFloat(row.p_Price) || 0;
                const itemTotal = qty * price;
                inc.amount += itemTotal;
                inc.viewData.push({
                    label: row.p_Name || 'สินค้า',
                    amount: itemTotal,
                    qty: qty,
                    type: 'สินค้า'
                });
                if (inc.viewData.length === 1) {
                    inc.details = `ขาย${row.p_Name}`;
                } else if (inc.viewData.length === 2) {
                    inc.details += ' และอื่นๆ';
                }
            }
        });
        const allTransactions = [
            ...Array.from(expenseMap.values()),
            ...Array.from(incomeMap.values())
        ].sort((a, b) => b.rawDate - a.rawDate);
        const finalResult = allTransactions.map(({ rawDate, ...rest }) => rest);
        console.log(finalResult);
        return res.status(200).send({
            message: "ดึงข้อมูลธุรกรรมสำเร็จ",
            status: 1,
            data: finalResult
        });
    } catch (error) {
        console.error("Error getting all transactions:", error);
        return res.status(500).send({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
            status: 0,
            error: error.message
        });
    }
}

exports.addFinancial = async (req, res) => {
    try {
        const {items} = req.body;
        const io = req.app.get('io'); 
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).send({ 
                message: "รูปแบบข้อมูลไม่ถูกต้อง กรุณาส่งเป็น Array ที่มีข้อมูล", 
                status: 0 
            });
        }
        const transactionDate = new Date();
        const headerSql = "INSERT INTO financials (f_Date) VALUES (?)";
        
        const [headerResult] = await conn.query(headerSql, [transactionDate]);
        const f_ID = headerResult.insertId; // ได้รหัสบิล (f_ID) มาใช้งานต่อ

        const insertValues = [];
        for (const item of items) {
            const { co_ID, fi_Amount, fi_Price } = item;
            if (!co_ID || !fi_Amount || !fi_Price) {
                return res.status(400).send({ 
                    message: "ข้อมูลในรายการย่อยไม่ครบถ้วน (co_ID, fi_Amount, fi_Price)", 
                    status: 0 
                });
            }

            insertValues.push([f_ID, co_ID, fi_Amount, fi_Price]);
        }

        const itemSql = "INSERT INTO financials_items (f_ID, co_ID, fi_Amount, fi_Price) VALUES ?";
        const [itemResult] = await conn.query(itemSql, [insertValues]);

        return res.status(201).send({ 
            message: "บันทึกรายการบัญชีสำเร็จ", 
            status: 1,
            data: {
                f_ID: f_ID,
                f_Date: transactionDate,
                totalItems: itemResult.affectedRows,
                items: items
            }
        });

    } catch (error) {
        console.error("Error adding financial record:", error);
        
        return res.status(500).send({ 
            message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", 
            status: 0,
            error: error.message 
        });
    }
};