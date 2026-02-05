const conn = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.getUser = async (req, res) => {
   try {
      const selectSQL = `
            SELECT u.u_ID, u.u_userName, u.u_role, d.de_tel, d.de_address, d.latitude, d.longitude 
            FROM users u
            LEFT JOIN usersdetail d ON u.u_ID = d.u_ID
        `;
      const [result] = await conn.query(selectSQL, []);

      if (result.length === 0) {
         return res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้งาน", status: 0 });
      }
      return res.status(200).send({ message: "ดึงข้อมูลสำเร็จ", data: result, status: 1 });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "Internal Server Error", status: 0 });
   }
}
exports.editProfile = async (req, res) => {
   const {
      u_ID, u_userName, u_passWord, u_role,
      de_tel, de_address, latitude, longitude
   } = req.body;

   try {
      let userSQL = `UPDATE users SET u_userName = ?, u_role = ?`;
      let userParams = [u_userName, u_role];
      if (u_passWord && u_passWord.trim() !== "") {
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(u_passWord, salt);
         userSQL += `, u_passWord = ?`;
         userParams.push(hashedPassword);
      }
      userSQL += ` WHERE u_ID = ?`;
      userParams.push(u_ID);
      await conn.query(userSQL, userParams);
      const infoSQL = `
            UPDATE usersdetail 
            SET de_tel = ?, de_address = ?, latitude = ?, longitude = ? 
            WHERE u_ID = ?
        `;
      await conn.query(infoSQL, [de_tel, de_address, latitude, longitude, u_ID]);
      return res.status(200).send({ message: "แก้ไขข้อมูลผู้ใช้งานสำเร็จ", status: 1 });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "แก้ไขข้อมูลไม่สำเร็จ", status: 0 });
   }
}

exports.deleteUser = async (req, res) => {
   const { id } = req.params;
   try {
      await conn.query(`DELETE FROM usersdetail WHERE u_ID = ?`, [id]);
      const [result] = await conn.query(`DELETE FROM users WHERE u_ID = ?`, [id]);
      if (result.affectedRows === 0) {
         return res.status(404).send({ message: "ไม่พบข้อมูลผู้ใช้งานที่ต้องการลบ", status: 0 });
      }
      return res.status(200).send({ message: "ลบข้อมูลผู้ใช้งานถาวรสำเร็จ", status: 1 });
   } catch (error) {
      console.error(error);
      return res.status(500).send({ message: "ไม่สามารถลบข้อมูลได้", status: 0 });
   }
}

exports.getProfile = async (req, res) => {
   const u_ID = req.userData.u_ID;

   try {
      const [userData] = await conn.query(
         "SELECT u_ID, u_userName, u_tel, u_line_id FROM users WHERE u_ID = ?",
         [u_ID]
      );

      if (userData.length === 0) {
         return res.status(404).json({ status: 0, message: "ไม่พบข้อมูลผู้ใช้งาน" });
      }

      const [addresses] = await conn.query(
         "SELECT * FROM addresses WHERE u_ID = ? ORDER BY is_Default DESC, created_at DESC",
         [u_ID]
      );

      return res.status(200).json({
         status: 1,
         message: "ดึงข้อมูลสำเร็จ",
         data: {
            user: userData[0],
            addresses: addresses
         }
      });

   } catch (error) {
      console.error("Get Profile Error:", error);
      res.status(500).json({ status: 0, message: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์" });
   }
};

exports.updateProfile = async (req, res) => {
   const u_ID = req.userData.u_ID;
   const { u_userName, u_tel } = req.body;

   try {
      await conn.query(
         "UPDATE users SET u_userName = ?, u_tel = ? WHERE u_ID = ?",
         [u_userName, u_tel, u_ID]
      );

      return res.status(200).json({ status: 1, message: "อัปเดตข้อมูลส่วนตัวสำเร็จ" });
   } catch (error) {
      res.status(500).json({ status: 0, message: "ไม่สามารถอัปเดตข้อมูลได้" });
   }
};

exports.addAddress = async (req, res) => {
   const u_ID = req.userData.u_ID;
   const { addr_Name, addr_Detail, latitude, longitude, is_Default } = req.body;

   try {
      await conn.query('START TRANSACTION');

      if (is_Default === 1) {
         await conn.query("UPDATE addresses SET is_Default = 0 WHERE u_ID = ?", [u_ID]);
      }

      await conn.query(
         "INSERT INTO addresses (u_ID, addr_Name, addr_Detail, latitude, longitude, is_Default) VALUES (?, ?, ?, ?, ?, ?)",
         [u_ID, addr_Name, addr_Detail, latitude, longitude, is_Default]
      );

      await conn.query('COMMIT');
      return res.status(200).json({ status: 1, message: "เพิ่มที่อยู่ใหม่สำเร็จ" });
   } catch (error) {
      await conn.query('ROLLBACK');
      res.status(500).json({ status: 0, message: "ไม่สามารถเพิ่มที่อยู่ได้" });
   }
};

exports.deleteAddress = async (req, res) => {
    const u_ID = req.userData.u_ID;
    const { addr_ID } = req.params;

    try {
      
        const [result] = await conn.query(
            "DELETE FROM addresses WHERE addr_ID = ? AND u_ID = ?",
            [addr_ID, u_ID]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ status: 0, message: "ไม่พบที่อยู่ที่ต้องการลบ" });
        }

        return res.status(200).json({ status: 1, message: "ลบที่อยู่สำเร็จ" });
    } catch (error) {
        res.status(500).json({ status: 0, message: "เซิร์ฟเวอร์ขัดข้อง" });
    }
};