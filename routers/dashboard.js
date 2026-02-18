const express = require("express")
const router = express.Router()
const dashboardControllers = require('../controllers/dashboardController')
const Middlewere = require('../middleware/validate')
router.get('/dashboardData',Middlewere.validateToken,dashboardControllers.CountProduct)
module.exports = router