const express = require("express")
const router = express.Router()
const usersController = require('../controllers/userControllers')
const Middlewere = require('../middleware/validate')
router.get('/getUser',Middlewere.validateToken,usersController.getUser)
router.patch('/editProfile', Middlewere.validateToken, usersController.editProfile)
router.delete('/deleteUser/:id', Middlewere.validateToken, usersController.deleteUser)
router.get('/profile', Middlewere.validateToken, usersController.getProfile)
router.put('/profile/update', Middlewere.validateToken, usersController.updateProfile)
router.get('/addresses/get', Middlewere.validateToken, usersController.getAddresses)
router.post('/addresses/add', Middlewere.validateToken, usersController.addAddress)
router.put('/addresses/update', Middlewere.validateToken, usersController.updateAddress)
router.delete('/addresses/:addr_ID', Middlewere.validateToken, usersController.deleteAddress);
router.put('/addresses/set-default', Middlewere.validateToken, usersController.setDefaultAddress);
module.exports = router