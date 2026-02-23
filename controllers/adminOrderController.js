const conn = require('../db');

// 1. ดึงข้อมูลการตั้งค่า
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await conn.query("SELECT * FROM system_settings WHERE s_key = 1");
        if (rows.length > 0) {
            // ส่งออกไปทั้งก้อนเลย { s_value, start_date, end_date }
            return res.status(200).json({ status: 1, data: rows[0] });
        }
        res.status(404).json({ status: 0, message: "ไม่พบการตั้งค่า" });
    } catch (error) {
        res.status(500).json({ status: 0, message: error.message });
    }
};

// 2. อัปเดตข้อมูลการตั้งค่า
exports.updateSettings = async (req, res) => {
    const { s_value, start_date, end_date } = req.body;
    try {
        // ดักค่าว่าง: ถ้าหน้าบ้านส่ง "" มา ให้เป็น null เพื่อลงคอลัมน์ DATE ได้
        const finalStart = (start_date && start_date !== "") ? start_date : null;
        const finalEnd = (end_date && end_date !== "") ? end_date : null;

        const sql = `
            UPDATE system_settings 
            SET s_value = ?, 
                start_date = ?, 
                end_date = ? 
            WHERE s_key = 1
        `;
        
        await conn.query(sql, [s_value, finalStart, finalEnd]);
        res.status(200).json({ status: 1, message: "บันทึกสำเร็จ" });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ status: 0, message: "Server Error" });
    }
};