const express = require("express")
const router = express.Router()
const usersController = require('../controllers/userControllers')
const Middlewere = require('../middleware/validate')
router.patch('/editProfile' ,Middlewere.validateToken, usersController.editProfile)
router.get('/allUser',Middlewere.validateToken,usersController.getUser)
module.exports = router