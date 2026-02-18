const express = require("express")
const router = express.Router()
const finalcialController= require('../controllers/financialController')
const Middlewere = require('../middleware/validate')
router.get('/',Middlewere.validateToken,finalcialController.getFinan)
router.post('/addCost',Middlewere.validateToken,finalcialController.addFinancial)
router.patch('/updateFinan',Middlewere.validateToken,finalcialController.updateFinancial)
router.delete('/deleteFinan',Middlewere.validateToken,finalcialController.deleteFinancial)
module.exports = router