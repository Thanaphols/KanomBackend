const express = require("express")
const router = express.Router()
const orderController = require('../controllers/adminOrderController')
const Middlewere = require('../middleware/validate')
router.get('/getSettings',Middlewere.validateToken,orderController.getSettings)
router.patch('/updateSettings',Middlewere.validateToken,orderController.updateSettings)
module.exports = router