const express = require("express")
const router = express.Router()
const authController = require('../controllers/authControllers')
const Middlewere = require('../middleware/validate')
router.post('/register' , authController.register)
router.post('/login' , authController.login)
router.post('/check',authController.checkUser)
router.delete('/deleteUser',Middlewere.validateToken, authController.deleteUser)
router.get('/checkLogin',authController.checkLogin)
router.post('/line-auth', authController.handleLineAuth);
module.exports = router