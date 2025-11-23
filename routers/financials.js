const express = require("express")
const router = express.Router()
const finalcialController= require('../controllers/financialController')
router.get('/',finalcialController.getFinan)
module.exports = router