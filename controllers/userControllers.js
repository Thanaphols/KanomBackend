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