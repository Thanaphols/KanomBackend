const express = require("express")
const router = express.Router()
const costControllers = require('../controllers/costControllers')
const Middlewere = require('../middleware/validate')
router.get('/',Middlewere.validateToken,costControllers.getCost)
router.post('/addCost',Middlewere.validateToken,costControllers.addCost)
router.patch('/editCost',Middlewere.validateToken,costControllers.editCost)
router.delete('/deleteCost/:co_ID',Middlewere.validateToken,costControllers.deleteCost)
module.exports = router