const express = require("express")
const router = express.Router()
const dashboardControllers = require('../controllers/dashboardController')
router.get('/dashboardData',dashboardControllers.CountProduct)
module.exports = router