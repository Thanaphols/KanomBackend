const conn = require('../db')
exports.getCost= async (req,res)=>{
   try {
        const sql = "SELECT * FROM costs ORDER BY co_ID ASC";
        
       const [results] = await conn.query(sql);
      const data = results;
        return res.status(200).send({ 
            message: "Get Success", 
            status: 1, 
            data: data 
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({ 
            message: "Something went wrong", 
            status: 0 
        });
    }
}


exports.addCost = async (req, res) => {
    const { co_Name, co_Unit, co_Price, co_detail } = req.body;
    const io = req.app.get('io'); 
    try {
        if (!co_Name || !co_Unit || !co_Price) {
            return res.status(400).send({ 
                message: "กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, หน่วย, ราคา)", 
                status: 0 
            });
        }
        const sql = `
            INSERT INTO costs (co_Name, co_Unit, co_Price, co_detail) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await conn.query(sql, [co_Name, co_Unit, co_Price, co_detail]);
        const data = result[0]
        if (result.affectedRows === 0) {
             return res.status(500).send({ message: "ไม่สามารถเพิ่มข้อมูลได้", status: 0 });
        } 
            io.emit('refreshCost'); 
            return res.status(201).send({  message: "เพิ่มข้อมูลต้นทุนสำเร็จ",  status: 1, data: data});
        
    } catch (error) {
        console.error("Add Cost Error:", error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", status: 0 });
    }
};

exports.editCost = async (req, res) => {
    const { c_ID, co_Name, co_Unit, co_Price, co_detail } = req.body;
    const io = req.app.get('io'); // ดึง Socket.io instance มาใช้

    try {
        if (!c_ID) {
            return res.status(400).json({ message: 'Error Please Enter Data' });
        }
        const sql = `
            UPDATE costs 
            SET co_Name = ?, co_Unit = ?, co_Price = ?, co_detail = ?
            WHERE c_ID = ?
        `;
        
        // รูปแบบการเรียกใช้ขึ้นอยู่กับ Library ที่ใช้ (mysql2/promise แนะนำแบบนี้)
        const [result] = await db.query(sql, [co_Name, co_Unit, co_Price, co_detail, c_ID]);

        // เช็คว่าหา ID เจอและอัปเดตได้จริงไหม
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cost not found or ID incorrect' });
        }

        // 3. Real-time Trigger: ส่งข้อมูลที่แก้แล้วผ่าน Socket.io
        // ใครที่ listen event ชื่อ 'cost_update' อยู่จะได้ข้อมูลชุดใหม่ทันที
        const updatedData = { c_ID, co_Name, co_Unit, co_Price, co_detail };
        io.emit('cost_update', updatedData);

        // 4. Response กลับไปหาคนกดแก้ไข
        res.status(200).json({
            message: 'Update successful',
            data: updatedData
        });

    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};