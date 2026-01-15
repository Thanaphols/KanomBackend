const express = require("express")
const router = express.Router()
const finalcialController= require('../controllers/financialController')
router.get('/',finalcialController.getFinan)
router.post('/addCost',finalcialController.addFinancial)
module.exports = router