const conn = require('../db') 

exports.getStore = async (req, res) => {
    try {
        const sql = "SELECT * FROM shops ORDER BY s_ID DESC";
        const [rows] = await conn.query(sql);

        return res.status(200).send({ 
            message: "Get Store Success", 
            status: 1,
            data: rows 
        });

    } catch (error) {
        console.error("Error fetching stores:", error);
        return res.status(500).send({ 
            message: "Something went wrong", 
            status: 0,
            error: error.message 
        });
    }
}

exports.addStore = async (req, res) => {
    try {
        const { s_Name, latitude, longitude, s_Detail, s_Status } = req.body;

        // Validation เบื้องต้น
        if (!s_Name || !latitude || !longitude) {
            return res.status(400).send({ 
                message: "ข้อมูลไม่ครบถ้วน (ชื่อร้าน, พิกัด)", 
                status: 0 
            });
        }

        const sql = "INSERT INTO shops (s_Name, latitude, longitude, s_Detail, s_Status) VALUES (?, ?, ?, ?, ?)";
        const values = [s_Name, latitude, longitude, s_Detail || '', s_Status ?? 1];
        const [result] = await conn.query(sql, values);
        return res.status(201).send({ 
            message: "บันทึกข้อมูลร้านค้าสำเร็จ", 
            status: 1,
            data: {
                s_ID: result.insertId,
                ...req.body
            }
        });
    } catch (error) {
        console.error("Error adding store:", error);
        return res.status(500).send({ 
            message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", 
            status: 0,
            error: error.message 
        });
    }
}
exports.updateStore = async (req, res) => {
    const {s_ID}  = req.params; 
    const {  s_Name,latitude, longitude, s_Detail,s_Status} = req.body;
    if ( !s_ID || !s_Name) {
        return res.status(400).json({ status: 0,message: "ข้อมูลไม่ครบถ้วน (ต้องการ ID และชื่อร้าน)"});
    }
    try {
        const checkSql = `SELECT s_ID FROM shops WHERE s_ID = ?`;
        const [rows] = await conn.query(checkSql, [s_ID]);
        if (rows.length === 0) {
            return res.status(404).json({status: 0, message: "ไม่พบไอดีร้านค้านี้ในระบบ ไม่สามารถอัปเดตได้"});
        }
        const sql = `  UPDATE shops  SET s_Name = ?,latitude = ?,longitude = ?,s_Detail = ?, s_Status = ?
            WHERE s_ID = ? `;
        const [result] = await conn.query(sql, [ s_Name,latitude,longitude,s_Detail,s_Status,s_ID]);
        if (result.affectedRows > 0) {
            res.status(200).json({  status: 1,  message: "อัปเดตข้อมูลร้านค้าสำเร็จ" });
        } else {
            res.status(404).json({ status: 0, message: "ไม่พบข้อมูลร้านค้าที่ต้องการอัปเดต" });
        }

    } catch (error) {
        console.error("Update Store Error:", error);
        res.status(500).json({    status: 0,   message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์"   });
    }
};
exports.deleteStore = async (req, res) => {
    const { s_ID } = req.params;
    if (!s_ID) {
        return res.status(400).json({ status: 0, message: "กรุณาระบุ ID ของร้านค้าที่ต้องการลบ" });
    }
    try {
        const checkSql = `SELECT s_ID FROM shops WHERE s_ID = ?`;
        const [rows] = await conn.query(checkSql, [s_ID]);
        if (rows.length === 0) {
            return res.status(404).json({status: 0,message: "ไม่พบข้อมูลร้านค้านี้ในระบบ ไม่สามารถทำการลบได้"});
        }

        const deleteSql = `DELETE FROM shops WHERE s_ID = ?`;
        const [result] = await conn.query(deleteSql, [s_ID]);
        if (result.affectedRows > 0) {
            res.status(200).json({status: 1,message: "ลบข้อมูลร้านค้าเรียบร้อยแล้ว" });
        } else {
            res.status(400).json({ status: 0,message: "ลบข้อมูลไม่สำเร็จ"});
        }
    } catch (error) {
        console.error("Delete Store Error:", error);
        res.status(500).json({status: 0,message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ ไม่สามารถลบข้อมูลได้"});
    }
};