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
    const { co_ID, co_Name, co_Unit, co_Price, co_detail } = req.body;
    const io = req.app.get('io'); // ดึง Socket.io instance มาใช้
    try {
        if (!co_ID) {
            return res.status(400).json({ message: 'Error Please Enter Data' });
        }
        const sql = `  UPDATE costs    SET co_Name = ?, co_Unit = ?, co_Price = ?, co_detail = ?
            WHERE co_ID = ?
        `;
        const [result] = await conn.query(sql, [co_Name, co_Unit, co_Price, co_detail, co_ID]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0,message: 'Cost not found or ID incorrect' });
        }
        const data = result[0];
        io.emit('cost_update', updatedData);
       return res.status(200).json({  message: 'Update successful', status: 1 , data: data});

    } catch (error) {
        console.error('Update Error:', error);
       return res.status(500).json({ status: 0,message: 'Server Error', error: error.message });
    }
};


exports.deleteCost = async (req, res) => {
    const { co_ID } = req.body; // รับค่า co_ID จาก body ตามที่ระบุ
    const io = req.app.get('io'); 

    try {
        if (!co_ID) {
            return res.status(400).json({status: 0, message: 'Error: Missing co_ID' });
        }

        const sql = `DELETE FROM costs WHERE co_ID = ?`; 
        
        const [result] = await conn.query(sql, [co_ID]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cost not found or already deleted', status: 0 });
        }
        io.emit('cost_delete', { co_ID });
        res.status(200).json({
            message: 'Delete successful',
            status: 1
        });

    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ status: 0,message: 'Server Error', error: error.message });
    }
};