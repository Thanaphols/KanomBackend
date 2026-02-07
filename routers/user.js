const express = require("express")
const router = express.Router()
const usersController = require('../controllers/userControllers')
const Middlewere = require('../middleware/validate')
router.patch('/editProfile' ,Middlewere.validateToken, usersController.editProfile)
router.get('/getUser',Middlewere.validateToken,usersController.getUser)
router.patch('/editProfile', Middlewere.validateToken, usersController.editProfile)
router.delete('/deleteUser/:id', Middlewere.validateToken, usersController.deleteUser)
router.get('/profile', Middlewere.validateToken, usersController.getProfile)
router.put('/profile/update', Middlewere.validateToken, usersController.updateProfile)
router.post('/addresses/add', Middlewere.validateToken, usersController.addAddress)
router.delete('/addresses/:addr_ID', Middlewere.validateToken, usersController.deleteAddress);
module.exports = router