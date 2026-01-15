const conn = require('../db') 

exports.getStore = async (req, res) => {
    try {
        const sql = "SELECT * FROM store ORDER BY s_ID DESC";
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