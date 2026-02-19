const conn = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads/products';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, 'product-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
}).single('p_Img');

// exports.getallProduct
exports.getallProduct = async (req, res) => {
    try {
        const SQL = `SELECT product.p_ID, product.c_ID, product.p_Name, product.p_Detail, product.p_Price, p_Img, category.c_Name 
                     FROM product INNER JOIN category ON product.c_ID = category.c_ID ORDER BY p_ID ASC`
        const [result] = await conn.query(SQL)
        const data = result
        return res.status(200).send({ message: "ดึงข้อมูลสินค้าสำเร็จ", data, status: 1 }) //
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า', status: 0 }) //
    }
}

// exports.addProduct
exports.addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).send({ message: "เกิดข้อผิดพลาดในการอัปโหลดไฟล์", status: 0 });
        const { p_Name, p_Detail, p_Price, c_ID } = req.body;
        const p_Img = req.file ? req.file.filename : 'noimg.png'; 
        
        const io = req.app.get('io');

        try {
            if (!p_Name || !p_Detail || !p_Price || !c_ID) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).send({ message: "กรุณากรอกข้อมูลให้ครบถ้วน", status: 0 });
            }

            const SQL = `INSERT INTO product (p_Name, p_Detail, p_Price, c_ID, p_Img) VALUES (?, ?, ?, ?, ?)`;
            const [result] = await conn.query(SQL, [p_Name, p_Detail, p_Price, c_ID, p_Img]);

            if (result.affectedRows === 0) {
                return res.status(401).send({ message: "ไม่สามารถเพิ่มข้อมูลสินค้าได้", status: 0 });
            }
            io.emit('refreshProduct');
            return res.status(201).send({ message: "เพิ่มสินค้าเรียบร้อยแล้ว", status: 1 });
            
        } catch (error) {
            console.error("Add Product Error:", error);
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).send({ message: 'เกิดข้อผิดพลาดภายในระบบ', status: 0 });
        }
    });
};

// exports.getProductID
exports.getProductID = async (req, res) => {
    const { p_id } = req.params
    try {
        if (!p_id) {
            return res.status(400).send({ message: 'ไม่พบรหัสสินค้า กรุณาลองใหม่อีกครั้ง' }) //
        }
        const SQL = "SELECT * FROM product WHERE p_id = ?"
        const [result] = await conn.query(SQL, [p_id])
        if (result.length === 0) {
            return res.status(401).send({ message: 'ไม่พบข้อมูลสินค้าชิ้นนี้ในระบบ', status: 0 }) //
        }
        const data = result[0]
        return res.status(200).send({ message: 'ค้นหาข้อมูลสินค้าสำเร็จ', data: data, status: 1 }) //
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: 'เกิดข้อผิดพลาดในการค้นหาข้อมูลสินค้า', status: 0 }) //
    }
}

// exports.updateProduct
exports.updateProduct = async (req, res) => {
    upload(req, res, async (err) => {
        const { p_ID, p_Name, p_Detail, p_Price, c_ID } = req.body;
        const io = req.app.get('io');

        try {
            if (!p_ID || !p_Name || !p_Detail || !p_Price || !c_ID) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).send({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', status: 0 }); //
            }

            const [oldData] = await conn.query("SELECT p_Img FROM product WHERE p_ID = ?", [p_ID]);
            if (oldData.length === 0) return res.status(404).send({ message: "ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข" }); //

            let p_Img = oldData[0].p_Img;
            if (req.file) {
                p_Img = req.file.filename; 
                if (oldData[0].p_Img) {
                    const oldPath = `./uploads/products/${oldData[0].p_Img}`;
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            }

            const updateSQL = `UPDATE product SET p_Name = ?, p_Detail = ?, p_Price = ?, c_ID = ?, p_Img = ? WHERE p_ID = ?`;
            await conn.query(updateSQL, [p_Name, p_Detail, p_Price, c_ID, p_Img, p_ID]);

            io.emit('refreshProduct');
            return res.status(200).send({ message: "แก้ไขข้อมูลสินค้าสำเร็จ", status: 1 }); //
        } catch (error) {
            return res.status(500).send({ message: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูลสินค้า', status: 0 }); //
        }
    });
};

// exports.deleteProduct
exports.deleteProduct = async (req, res) => {
    const { p_ID } = req.params
    const io = req.app.get('io')
    try {
        if (!p_ID) {
            return res.status(400).send({ message: `กรุณาระบุรหัสสินค้าที่ต้องการลบ`, status: 0 }) //
        }
        const checkSQL = `SELECT * FROM product WHERE p_ID = ?`
        const [checkResult] = await conn.query(checkSQL, [p_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({ message: `ไม่พบรหัสสินค้าชิ้นนี้ในระบบ`, status: 0 }) //
        }

        const deleteSQL = `DELETE FROM product WHERE p_ID = ?`
        const [deleteResult] = await conn.query(deleteSQL, [p_ID])
        if (deleteResult.affectedRows === 0) {
            return res.status(400).send({ message: `ไม่สามารถลบข้อมูลสินค้าได้`, status: 0 }) //
        }
        io.emit('refreshProduct')
        return res.status(200).send({ message: `ลบข้อมูลสินค้าเรียบร้อยแล้ว`, status: 1 }) //
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `เกิดข้อผิดพลาดในการลบสินค้า`, status: 0 }) //
    }
}