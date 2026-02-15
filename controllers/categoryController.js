const conn = require('../db')

exports.allCategory = async (req, res) => {
    try {
        const [result] = await conn.query("SELECT * FROM category ORDER BY c_ID ASC")
        const data = result
        return res.status(200).send({ message: "ดึงข้อมูลหมวดหมู่ทั้งหมดสำเร็จ", data: data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูล', status: 0 })
    }
}

exports.selectCategory = async (req, res) => {
    const { c_ID } = req.params
    try {
        if (!c_ID) {
            return res.status(400).send({ message: "กรุณาระบุรหัสหมวดหมู่", status: 0 })
        }
        const SQL = "SELECT * FROM category WHERE c_ID = ?"
        const [result] = await conn.query(SQL, [c_ID])
        if (result.length === 0) {
            return res.status(400).send({ message: "ไม่พบรหัสหมวดหมู่: " + c_ID, status: 0 })
        }
        const data = result[0]
        return res.status(200).send({ message: "ดึงข้อมูลสำเร็จ", data: data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(401).send({ message: "เกิดข้อผิดพลาดในการเชื่อมต่อ", status: 0 })
    }
}

exports.getCategoryWithCount = async (req, res) => {
    try {
        const SQL = `
            SELECT c.c_ID, c.c_Name, COUNT(p.p_ID) as productCount 
            FROM category c
            LEFT JOIN product p ON c.c_ID = p.c_ID
            GROUP BY c.c_ID
        `;
        const [result] = await conn.query(SQL);
        return res.status(200).send({ message: "ดึงข้อมูลพร้อมจำนวนสินค้าสำเร็จ", data: result, status: 1 });
    } catch (error) {
        return res.status(500).send({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่", status: 0 });
    }
};

exports.addCategory = async (req, res) => {
    const { c_Name } = req.body
    try {
        if (!c_Name) {
            return res.status(400).send({ message: "กรุณากรอกชื่อหมวดหมู่", status: 0 })
        }
        const checkCategorySQL = `SELECT * from category where c_Name = ?`
        const [checkResult] = await conn.query(checkCategorySQL, [c_Name])
        if (checkResult.length > 0) {
            return res.status(409).send({ message: 'มีชื่อหมวดหมู่ "' + c_Name + '" อยู่ในระบบแล้ว', status: 0 })
        }
        const SQL = `INSERT INTO category (c_Name) VALUES (?)`
        const [result] = await conn.query(SQL, [c_Name])
        if (result.affectedRows === 0) {
            return res.status(401).send({ message: "ไม่สามารถเพิ่มหมวดหมู่ได้", status: 0 })
        }
        return res.status(201).send({ message: "เพิ่มหมวดหมู่สินค้าสำเร็จ", status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(401).send({ message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล", status: 0 })
    }
}

exports.updateCategory = async (req, res) => {
    const { c_ID, c_Name } = req.body
    try {
        if (!c_ID || !c_Name) {
            return res.status(400).send({ message: "กรุณากรอกข้อมูลให้ครบถ้วน", status: 0 })
        }
        const checkSQL = `SELECT * FROM category where c_ID = ? `
        const [checkResult] = await conn.query(checkSQL, [c_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({ message: 'ไม่พบรหัสหมวดหมู่: ' + c_ID, status: 0 })
        }
        const updateSQL = `UPDATE category set c_Name = ? WHERE c_ID = ?`
        const [result] = await conn.query(updateSQL, [c_Name, c_ID])
        if (result.affectedRows === 0) {
            return res.status(400).send({ message: "ไม่มีการเปลี่ยนแปลงข้อมูล หรือไม่สามารถอัปเดตได้", status: 0 })
        }
        return res.status(200).send({ message: "แก้ไขชื่อหมวดหมู่สำเร็จ", status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล', status: 0 })
    }
}

exports.deleteCategory = async (req, res) => {
    const { c_ID } = req.params
    try {
        if (!c_ID) {
            return res.status(400).send({ message: "รหัสหมวดหมู่ไม่ถูกต้อง", status: 0 })
        }
        const checkSQL = `SELECT * FROM category where c_ID = ?`
        const [checkResult] = await conn.query(checkSQL, [c_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({ message: 'ไม่พบรหัสหมวดหมู่: ' + c_ID, status: 0 })
        }
        
        // ลบสินค้าในหมวดหมู่นั้นก่อน
        const productSQL = `DELETE FROM product WHERE c_ID = ?`
        await conn.query(productSQL, [c_ID])
        
        // ลบหมวดหมู่
        const categorySQL = "DELETE FROM category WHERE c_ID = ?"
        const [categoryResult] = await conn.query(categorySQL, [c_ID])
        
        if (categoryResult.affectedRows === 0) {
            return res.status(400).send({ message: "ลบหมวดหมู่ไม่สำเร็จ", status: 0 })
        }
        return res.status(200).send({ message: "ลบหมวดหมู่และสินค้าที่เกี่ยวข้องทั้งหมดเรียบร้อยแล้ว", status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "เกิดข้อผิดพลาดในการลบข้อมูล", status: 0 })
    }
}