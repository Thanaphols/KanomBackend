const conn = require('../db')
exports.getFinan = async (req, res) => {
    try {
        // 1. ดึงข้อมูลรายจ่าย (Expenses)
        // *** เพิ่ม fi.co_ID ใน SELECT ***
        const expenseSql = `
            SELECT 
                f.f_ID, f.f_Date, 
                fi.fi_ID, fi.fi_Amount, fi.fi_Price, fi.co_ID,
                c.co_Name
            FROM financials f
            LEFT JOIN financials_items fi ON f.f_ID = fi.f_ID
            LEFT JOIN costs c ON fi.co_ID = c.co_ID 
            ORDER BY f.f_Date,f_ID DESC
        `;
        const [expensesRaw] = await conn.query(expenseSql);

        // 2. ดึงข้อมูลรายรับ (Incomes)
        // *** เพิ่ม oi.p_ID ใน SELECT ***
        const incomeSql = `
            SELECT 
                o.o_ID, o.o_date, o.o_Status, 
                oi.i_ID, oi.i_Amount, oi.p_ID,
                p.p_Name, p.p_Price
            FROM orders o
            LEFT JOIN ordersitems oi ON o.o_ID = oi.o_ID
            LEFT JOIN product p ON oi.p_ID = p.p_ID 
            WHERE o.o_Status = 1
            ORDER BY o.o_date,o.o_ID DESC
        `;
        const [incomesRaw] = await conn.query(incomeSql);

        // Helper Function: แปลงวันที่
        const formatDateThai = (date) => {
            if (!date) return "";
            const d = new Date(date);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear() + 543;
            return `${day}/${month}/${year}`;
        };

        // 3. จัดกลุ่มข้อมูลรายจ่าย
        const expenseMap = new Map();
        expensesRaw.forEach(row => {
            if (!expenseMap.has(row.f_ID)) {
                expenseMap.set(row.f_ID, {
                    id: row.f_ID, // ใช้ ID นี้สำหรับอ้างอิงตอนแก้ไข (c_ID)
                    type: 'รายจ่าย',
                    date: formatDateThai(row.f_Date),
                    rawDate: new Date(row.f_Date),
                    amount: 0,
                    category: 'วัตถุดิบ',
                    details: '',
                    viewData: []
                });
            }
            
            const exp = expenseMap.get(row.f_ID);
            
            if (row.fi_ID) {
                const itemTotal = parseFloat(row.fi_Price) || 0;
                exp.amount += itemTotal;
                
                exp.viewData.push({
                    label: row.co_Name || 'ไม่ระบุ',
                    amount: itemTotal,
                    qty: parseFloat(row.fi_Amount) || 0,
                    type: 'วัตถุดิบ',
                    iid: row.co_ID // *** ส่ง co_ID กลับไป ***
                });

                // สร้าง details
                if (exp.viewData.length === 1) {
                    exp.details = `ซื้อ${row.co_Name}`;
                } else if (exp.viewData.length === 2) {
                    exp.details += ' และอื่นๆ';
                }
            }
        });

        // 4. จัดกลุ่มข้อมูลรายรับ
        const incomeMap = new Map();
        incomesRaw.forEach(row => {
            if (!incomeMap.has(row.o_ID)) {
                incomeMap.set(row.o_ID, {
                    id: row.o_ID, // ใช้ ID นี้สำหรับอ้างอิงตอนแก้ไข (o_ID)
                    type: 'รายรับ',
                    date: formatDateThai(row.o_date),
                    rawDate: new Date(row.o_date),
                    amount: 0,
                    category: 'ขายสินค้า',
                    details: '',
                    viewData: []
                });
            }
            const inc = incomeMap.get(row.o_ID);
            
            if (row.i_ID) { // ตรวจสอบว่ามีรายการสินค้าหรือไม่
                const qty = parseFloat(row.i_Amount) || 0;
                const price = parseFloat(row.p_Price) || 0;
                const itemTotal = qty * price;
                
                inc.amount += itemTotal;
                inc.viewData.push({
                    label: row.p_Name || 'สินค้า',
                    amount: itemTotal,
                    qty: qty,
                    type: 'สินค้า',
                    iid: row.p_ID // *** ส่ง p_ID กลับไป ***
                });

                if (inc.viewData.length === 1) {
                    inc.details = `ขาย${row.p_Name}`;
                } else if (inc.viewData.length === 2) {
                    inc.details += ' และอื่นๆ';
                }
            }
        });

        // 5. รวมและส่งข้อมูล
        const allTransactions = [
            ...Array.from(expenseMap.values()),
            ...Array.from(incomeMap.values())
        ].sort((a, b) => b.rawDate - a.rawDate);

        // ตัด rawDate ออกก่อนส่ง response
        const finalResult = allTransactions.map(({ rawDate, ...rest }) => rest);

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
};
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
        io.emit('refreshFinancials');
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
exports.updateFinancial = async (req, res) => {
    const { type, items } = req.body;
    const io = req.app.get('io');
    // 1. รับ ID ตามประเภท
    const transactionId = type === 'รายรับ' ? req.body.o_ID : req.body.c_ID;

    console.log(`Updating (No Transaction) ${type} ID: ${transactionId}`);

    // Validation
    if (!transactionId || !items || !Array.isArray(items)) {
        return res.status(400).send({ message: "ข้อมูลไม่ครบถ้วน", status: 0 });
    }

    try {
        if (type === 'รายจ่าย') {
            // ====================================================
            //  MODE: รายจ่าย (Update financials & financials_items)
            // ====================================================
            
            // 1. อัปเดตวันที่
            const updateMainSql = `UPDATE financials SET f_Date = NOW() WHERE f_ID = ?`;
            await conn.query(updateMainSql, [transactionId]);

            // 2. ลบรายการเก่า
            const deleteItemsSql = `DELETE FROM financials_items WHERE f_ID = ?`;
            await conn.query(deleteItemsSql, [transactionId]);

            // 3. เพิ่มรายการใหม่
            if (items.length > 0) {
                const insertItemsSql = `
                    INSERT INTO financials_items (f_ID, co_ID, fi_Amount, fi_Price) 
                    VALUES ?
                `;
                const insertValues = items.map(item => [
                    transactionId, 
                    item.co_ID, 
                    item.fi_Amount, 
                    item.fi_Price
                ]);
                await conn.query(insertItemsSql, [insertValues]);
            }

        } else if (type === 'รายรับ') {
            // ====================================================
            //  MODE: รายรับ (Update orders & ordersitems)
            // ====================================================

            // 1. อัปเดตวันที่
            const updateMainSql = `UPDATE orders SET o_date = NOW() WHERE o_ID = ?`;
            await conn.query(updateMainSql, [transactionId]);

            // 2. ลบรายการเก่า
            const deleteItemsSql = `DELETE FROM ordersitems WHERE o_ID = ?`;
            await conn.query(deleteItemsSql, [transactionId]);

            // 3. เพิ่มรายการใหม่
            if (items.length > 0) {
                const insertItemsSql = `
                    INSERT INTO ordersitems (o_ID, p_ID, i_Amount) 
                    VALUES ?
                `;
                const insertValues = items.map(item => [
                    transactionId, 
                    item.p_ID, 
                    item.fi_Amount // หน้าบ้านส่งมาเป็น fi_Amount แต่ลง DB ช่อง i_Amount
                ]);
                await conn.query(insertItemsSql, [insertValues]);
            }
        }
        io.emit('refreshFinancials');
        // ส่ง Response กลับทันทีเมื่อทำครบทุกขั้นตอน
        return res.status(200).send({ 
            message: `อัปเดตข้อมูล ${type} เรียบร้อยแล้ว`, 
            status: 1, 
            updatedId: transactionId,
            data: req.body 
        });

    } catch (error) {
        console.error(`Update ${type} Error:`, error);
        return res.status(500).send({ 
            message: "เกิดข้อผิดพลาดในการอัปเดตข้อมูล", 
            status: 0, 
            error: error.message 
        });
    }
};

exports.deleteFinancial = async (req, res) => {
    // รับค่า id และ type จาก Body
    const { id, type } = req.body;
    const io = req.app.get('io');
    console.log(`Deleting ${type} ID: ${id}`);

    if (!id || !type) {
        return res.status(400).send({ message: "ข้อมูลไม่ครบ (ID หรือ Type หายไป)", status: 0 });
    }

    try {
        if (type === 'รายจ่าย') {
            // --- ลบรายจ่าย (financials & financials_items) ---
            
            // 1. ลบรายการลูกก่อน (Items)
            const deleteItemsSql = `DELETE FROM financials_items WHERE f_ID = ?`;
            await conn.query(deleteItemsSql, [id]);

            // 2. ลบรายการแม่ (Header)
            const deleteMainSql = `DELETE FROM financials WHERE f_ID = ?`;
            await conn.query(deleteMainSql, [id]);

        } else if (type === 'รายรับ') {
            // --- ลบรายรับ (orders & ordersitems) ---

            // 1. ลบรายการลูกก่อน (Items)
            const deleteItemsSql = `DELETE FROM ordersitems WHERE o_ID = ?`;
            await conn.query(deleteItemsSql, [id]);

            // 2. ลบรายการแม่ (Header)
            const deleteMainSql = `DELETE FROM orders WHERE o_ID = ?`;
            await conn.query(deleteMainSql, [id]);
        }
        io.emit('refreshFinancials');
        return res.status(200).send({ 
            message: `ลบข้อมูล ${type} สำเร็จ`, 
            status: 1, 
            deletedId: id 
        });

    } catch (error) {
        console.error("Delete Error:", error);
        return res.status(500).send({ 
            message: "เกิดข้อผิดพลาดในการลบข้อมูล", 
            status: 0, 
            error: error.message 
        });
    }
};