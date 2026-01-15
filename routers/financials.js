const express = require("express")
const router = express.Router()
const finalcialController= require('../controllers/financialController')
router.get('/',finalcialController.getFinan)
router.post('/addCost',finalcialController.addFinancial)
router.patch('/updateFinan',finalcialController.updateFinancial)
router.delete('/deleteFinan',finalcialController.deleteFinancial)
module.exports = router