const express = require("express")
const router = express.Router()
const costControllers = require('../controllers/costControllers')
router.get('/',costControllers.getCost)
module.exports = router