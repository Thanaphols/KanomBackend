const express = require("express")
const router = express.Router()
const orderController = require('../controllers/orderControllers')
const validateMiddlewere = require('../middleware/validate')
const authMiddlewere = require('../middleware/auth')
router.get('/', orderController.getallOrder)
router.post('/addOrder',validateMiddlewere.validateToken,authMiddlewere.authVerify,orderController.addOrder)

module.exports = router