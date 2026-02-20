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
        const { items } = req.body;
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
    const u_ID = req.userData.u_ID; // ตรวจสอบว่าใช้ตัวแปร u_ID จาก middleware ถูกต้อง

    const transactionId = type === 'รายรับ' ? req.body.o_ID : req.body.c_ID;

    // [ข้อ 7 & 9] ปิดการแก้ไขรายรับตามโจทย์พี่เลยครับ
    if (type === 'รายรับ') {
        return res.status(403).send({
            message: "ไม่อนุญาตให้แก้ไขข้อมูลรายรับเพื่อความปลอดภัยทางการเงิน",
            status: 0
        });
    }

    if (!transactionId || !items || !Array.isArray(items)) {
        return res.status(400).send({ message: "ข้อมูลไม่ครบถ้วน", status: 0 });
    }

    try {
        // เริ่ม Transaction เพื่อความปลอดภัย (ถ้าล้มเหลวให้ย้อนกลับทั้งหมด)
        await conn.query('START TRANSACTION');

        // 1. ดึงราคารวมเก่าก่อนแก้ (คำนวณจาก financials_items เดิม)
        const [oldData] = await conn.query(
            "SELECT SUM(fi_Price) as total FROM financials_items WHERE f_ID = ?",
            [transactionId]
        );
        const oldTotal = oldData[0].total || 0;

        // 2. คำนวณราคารวมใหม่จากรายการที่ส่งมา
        const newTotal = items.reduce((sum, item) => sum + (parseFloat(item.fi_Price) || 0), 0);

        // 3. อัปเดตข้อมูลหลัก (วันที่)
        await conn.query(`UPDATE financials SET f_Date = NOW() WHERE f_ID = ?`, [transactionId]);

        // 4. ลบรายการเก่าและเพิ่มรายการใหม่
        await conn.query(`DELETE FROM financials_items WHERE f_ID = ?`, [transactionId]);

        if (items.length > 0) {
            const insertItemsSql = `INSERT INTO financials_items (f_ID, co_ID, fi_Amount, fi_Price) VALUES ?`;
            const insertValues = items.map(item => [
                transactionId,
                item.co_ID,
                item.fi_Amount,
                item.fi_Price
            ]);
            await conn.query(insertItemsSql, [insertValues]);
        }

        // 5. บันทึกประวัติการแก้ไขลง financial_logs (ใช้ชื่อคอลัมน์ตามรูปเป๊ะ)
        const logSql = `
            INSERT INTO financial_logs (f_ID, u_ID, old_price, new_price, action_type) 
            VALUES (?, ?, ?, ?, 'UPDATE')
        `;
        await conn.query(logSql, [transactionId, u_ID, oldTotal, newTotal]);

        // ยืนยันข้อมูลทั้งหมด
        await conn.query('COMMIT');

        io.emit('refreshFinancials');
        return res.status(200).send({
            message: `บันทึกประวัติการแก้ไขสำเร็จ (ยอดเดิม: ${oldTotal} -> ยอดใหม่: ${newTotal})`,
            status: 1
        });

    } catch (error) {
        await conn.query('ROLLBACK'); // ย้อนกลับถ้ามี Error
        console.error("Update Financial Error:", error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดในการบันทึก", status: 0 });
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

exports.getFinancialLogs = async (req, res) => {
    const { f_ID } = req.params;
    try {
        const SQL = `
            SELECT l.*, u.u_userName 
            FROM financial_logs l
            JOIN users u ON l.u_ID = u.u_ID
            WHERE l.f_ID = ?
            ORDER BY l.changed_at DESC
        `;
        const [logs] = await conn.query(SQL, [f_ID]);
        return res.status(200).send({ data: logs, status: 1 });
    } catch (error) {
        return res.status(500).send({ message: "ดึงข้อมูล Log ไม่สำเร็จ", status: 0 });
    }
};

exports.getAllRecipes = async (req, res) => {
    try {
        // ดึงสูตรทั้งหมดพร้อมจอยชื่อวัตถุดิบและราคาปัจจุบันมาด้วย
        const sql = `
            SELECT r.r_ID, r.r_Name, ri.co_ID, ri.amount, c.co_Name, c.co_Price
            FROM recipes r
            LEFT JOIN recipe_items ri ON r.r_ID = ri.r_ID
            LEFT JOIN costs c ON ri.co_ID = c.co_ID
            ORDER BY r.r_ID DESC
        `;
        const [results] = await conn.query(sql);

        // จัดกลุ่มข้อมูล (Grouping) เหมือนที่เราทำที่หน้าบ้านออเดอร์
        const recipes = results.reduce((acc, curr) => {
            if (!acc[curr.r_ID]) {
                acc[curr.r_ID] = {
                    r_ID: curr.r_ID,
                    r_Name: curr.r_Name,
                    ingredients: []
                };
            }
            if (curr.co_ID) {
                acc[curr.r_ID].ingredients.push({
                    co_ID: curr.co_ID,
                    co_Name: curr.co_Name,
                    amount: curr.amount,
                    price: curr.co_Price
                });
            }
            return acc;
        }, {});

        res.status(200).json({ status: 1, data: Object.values(recipes) });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// controllers/financialController.js
// 2. เพิ่มสูตรใหม่ (Create)
exports.addRecipe = async (req, res) => {
    const { r_Name, ingredients } = req.body;
    const io = req.app.get('io');
    try {
        // 1. บันทึกหัวข้อสูตร
        const [recipe] = await conn.query("INSERT INTO recipes (r_Name) VALUES (?)", [r_Name]);
        const r_ID = recipe.insertId;

        // 2. บันทึกวัตถุดิบในสูตร (ใช้ท่าเดียวกับ addFinancial ของพี่)
        if (ingredients && ingredients.length > 0) {
            const insertValues = ingredients.map(ing => [r_ID, ing.co_ID, ing.amount]);
            const itemSql = "INSERT INTO recipe_items (r_ID, co_ID, amount) VALUES ?";
            await conn.query(itemSql, [insertValues]);
        }
        io.emit('refreshRecipes');
        res.status(200).json({ status: 1, message: "สร้างสูตรสำเร็จ" });
    } catch (error) {
        console.error("Add Recipe Error:", error);
        res.status(500).json({ status: 0, message: "เกิดข้อผิดพลาดในการเพิ่มสูตร" });
    }
};

// 3. แก้ไขสูตร (Update)
exports.updateRecipe = async (req, res) => {
    const { r_ID } = req.params;
    const { r_Name, ingredients } = req.body;
    const io = req.app.get('io');
    try {
        // 1. อัปเดตชื่อสูตร
        await conn.query("UPDATE recipes SET r_Name = ? WHERE r_ID = ?", [r_Name, r_ID]);

        // 2. ลบวัตถุดิบเก่าออกก่อน
        await conn.query("DELETE FROM recipe_items WHERE r_ID = ?", [r_ID]);

        // 3. ใส่ข้อมูลใหม่เข้าไป
        if (ingredients && ingredients.length > 0) {
            const insertValues = ingredients.map(ing => [r_ID, ing.co_ID, ing.amount]);
            const itemSql = "INSERT INTO recipe_items (r_ID, co_ID, amount) VALUES ?";
            await conn.query(itemSql, [insertValues]);
        }
        io.emit('refreshRecipes');
        res.status(200).json({ status: 1, message: "แก้ไขสูตรสำเร็จ" });
    } catch (error) {
        console.error("Update Recipe Error:", error);
        res.status(500).json({ status: 0, message: "เกิดข้อผิดพลาดในการแก้ไขสูตร" });
    }
};

// 4. ลบสูตร (Delete)
exports.deleteRecipe = async (req, res) => {
    const { r_ID } = req.params;
    const io = req.app.get('io');
    try {
        // เนื่องจากเราตั้ง ON DELETE CASCADE ไว้ใน SQL ตอนสร้างตาราง 
        // ลบแค่ recipes วัตถุดิบใน recipe_items จะหายไปเองอัตโนมัติ
        await conn.query("DELETE FROM recipes WHERE r_ID = ?", [r_ID]);
        io.emit('refreshRecipes');
        res.status(200).json({ status: 1, message: "ลบสูตรเรียบร้อย" });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// ฟังก์ชันสำหรับดึงประวัติการแก้ไขของรายการนั้นๆ
exports.getAllFinancialLogs = async (req, res) => {
    try {
        const SQL = `
            SELECT 
                l.log_ID, 
                l.f_ID, 
                l.old_price, 
                l.new_price, 
                l.action_type, 
                l.changed_at,
                u.u_userName as admin_name,
                f.f_Date as original_date
            FROM financial_logs l
            LEFT JOIN users u ON l.u_ID = u.u_ID
            LEFT JOIN financials f ON l.f_ID = f.f_ID
            ORDER BY l.changed_at DESC
        `;

        const [logs] = await conn.query(SQL);

        return res.status(200).send({
            status: 1,
            data: logs
        });
    } catch (error) {
        console.error("Get All Logs Error:", error);
        return res.status(500).send({
            message: "เกิดข้อผิดพลาดในการดึงข้อมูลประวัติทั้งหมด",
            status: 0
        });
    }
};