const express = require("express")
const router = express.Router()
const orderController = require('../controller/orderControllers')
const mysql = require('../db')
router.get('/', orderController.getallOrder)


module.exports = router