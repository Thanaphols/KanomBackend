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
    limits: { fileSize: 5 * 1024 * 1024 } // จำกัด 5MB
}).single('p_Img');

exports.getallProduct = async (req, res) => {
    try {
        const SQL = `SELECT  product.p_ID,product.c_ID,product.p_Name,product.p_Detail,product.p_Price,p_Img,category.c_Name 
    FROM product INNER JOIN category ON product.c_ID = category.c_ID ORDER BY p_ID ASC`
        const [result] = await conn.query(SQL)
        const data = result
        return res.status(200).send({ message: "Select Success", data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: 'Someting Went Wrong', status: 0 })
    }
}
exports.addProduct = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(500).send({ message: "File Upload Error", status: 0 });

        const { p_Name, p_Detail, p_Price, c_ID } = req.body;
        const p_Img = req.file ? req.file.filename : null; // ได้ชื่อไฟล์มาถ้ามีการอัปโหลด
        const io = req.app.get('io');

        try {
            if (!p_Name || !p_Detail || !p_Price || !c_ID) {
                // ถ้าพัง ต้องลบรูปที่เพิ่งอัปโหลดทิ้งด้วย
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).send({ message: "Please Enter All Data" });
            }

            const SQL = `INSERT INTO product (p_Name, p_Detail, p_Price, c_ID, p_Img) VALUES (?, ?, ?, ?, ?)`;
            const [result] = await conn.query(SQL, [p_Name, p_Detail, p_Price, c_ID, p_Img]);

            if (result.affectedRows === 0) return res.status(401).send({ message: "Can't create Product", status: 0 });

            io.emit('refreshProduct');
            return res.status(201).send({ message: "Create Product Success", status: 1 });
        } catch (error) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).send({ message: 'Something Went Wrong', status: 0 });
        }
    });
};

exports.getProductID = async (req, res) => {
    const { p_id } = req.params
    try {
        if (!p_id) {
            return res.status(400).send({ message: 'ID product is missing Please Try agina later' })
        }
        const SQL = "SELECT * FROM product WHERE p_id = ?"
        const [result] = await conn.query(SQL, [p_id])
        if (result.length === 0) {
            return res.status(401).send({ message: 'Unknow Product ID : ' + p_id, status: 0 })
        }
        const data = result[0]
        return res.status(200).send({ message: 'Select Product ID : ' + p_id, data: data, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(400).send({ message: 'Something Went Wrong', status: 0 })
    }
}

exports.updateProduct = async (req, res) => {
    upload(req, res, async (err) => {
        const { p_ID, p_Name, p_Detail, p_Price, c_ID } = req.body;
        const io = req.app.get('io');

        try {
            if (!p_ID || !p_Name || !p_Detail || !p_Price || !c_ID) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).send({ message: 'Please Enter All Data', status: 0 });
            }

            // 1. ดึงข้อมูลเก่ามาเช็คเรื่องรูป
            const [oldData] = await conn.query("SELECT p_Img FROM product WHERE p_ID = ?", [p_ID]);
            if (oldData.length === 0) return res.status(404).send({ message: "Product Not Found" });

            let p_Img = oldData[0].p_Img;
            if (req.file) {
                p_Img = req.file.filename; // ใช้รูปใหม่
                // ลบรูปเก่าทิ้ง (ถ้ามี)
                if (oldData[0].p_Img) {
                    const oldPath = `./uploads/products/${oldData[0].p_Img}`;
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            }

            const updateSQL = `UPDATE product SET p_Name = ?, p_Detail = ?, p_Price = ?, c_ID = ?, p_Img = ? WHERE p_ID = ?`;
            await conn.query(updateSQL, [p_Name, p_Detail, p_Price, c_ID, p_Img, p_ID]);

            io.emit('refreshProduct');
            return res.status(200).send({ message: "Update Successfully", status: 1 });
        } catch (error) {
            return res.status(500).send({ message: 'Something Went Wrong', status: 0 });
        }
    });
};

exports.deleteProduct = async (req, res) => {
    const { p_ID } = req.params
    const io = req.app.get('io')
    try {
        if (!p_ID) {
            return res.status(400).send({ message: `Missing Product ID ${p_ID}`, status: 0 })
        }
        const checkSQL = `SELECT * FROM product WHERE p_ID = ?`
        const [checkResult] = await conn.query(checkSQL, [p_ID])
        if (checkResult.length === 0) {
            return res.status(404).send({ message: `Unknow Product ID : ${p_ID}`, status: 0 })
        }

        const deleteSQL = `DELETE FROM product WHERE p_ID = ?`
        const [deleteResult] = await conn.query(deleteSQL, [p_ID])
        if (deleteResult.affectedRows === 0) {
            return res.status(400).send({ message: `Delete Product ID : ${p_ID} Unsuccessfully`, status: 0 })
        }
        io.emit('refreshProduct')
        return res.status(200).send({ message: `Delete Product ID : ${p_ID} Successfully`, status: 1 })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: `Something Went Wrong`, status: 0 })
    }
}