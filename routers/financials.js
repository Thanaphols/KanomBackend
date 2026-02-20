const express = require("express")
const router = express.Router()
const financialController = require('../controllers/financialController')
const Middlewere = require('../middleware/validate')
router.get('/', Middlewere.validateToken, financialController.getFinan)
router.post('/addCost', Middlewere.validateToken, financialController.addFinancial)
router.patch('/updateFinan', Middlewere.validateToken, financialController.updateFinancial)
router.delete('/deleteFinan', Middlewere.validateToken, financialController.deleteFinancial)

router.get('/all-logs', Middlewere.validateToken, financialController.getAllFinancialLogs);

router.get('/recipes', Middlewere.validateToken, financialController.getAllRecipes)
router.post('/recipes', Middlewere.validateToken, financialController.addRecipe)
router.put('/recipes/:r_ID', Middlewere.validateToken, financialController.updateRecipe)
router.delete('/recipes/:r_ID', Middlewere.validateToken, financialController.deleteRecipe)

module.exports = router