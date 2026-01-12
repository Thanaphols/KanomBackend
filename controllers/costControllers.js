exports.getCost= async (req,res)=>{
   return res.status(200).send({message : "Edit Success" , status : 1})
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
            INSERT INTO cost (co_Name, co_Unit, co_Price, co_detail) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await conn.query(sql, [co_Name, co_Unit, co_Price, co_detail]);
        if (result.affectedRows === 1) {
            io.emit('refreshCost'); 
            return res.status(201).send({  message: "เพิ่มข้อมูลต้นทุนสำเร็จ",  status: 1, data});
        } else {
            return res.status(500).send({ message: "ไม่สามารถเพิ่มข้อมูลได้", status: 0 });
        }
    } catch (error) {
        console.error("Add Cost Error:", error);
        return res.status(500).send({ message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", status: 0 });
    }
};