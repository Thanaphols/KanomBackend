const express = require("express")
const router = express.Router()
const orderController = require('../controller/orderControllers')
router.get('/', orderController.getallOrder)


module.exports = router