const express = require("express")
const router = express.Router()
const authController = require('../controllers/authControllers')

router.post('/register' , authController.register)
router.post('/login' , authController.login)
router.post('/check',authController.checkUser)
router.patch('/updateProfile',authController.updateProfile)
router.delete('/deleteUser', authController.deleteUser)
module.exports = router