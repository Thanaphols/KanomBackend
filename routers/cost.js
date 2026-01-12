const express = require("express")
const router = express.Router()
const costControllers = require('../controllers/costControllers')
router.get('/',costControllers.getCost)
router.post('/addCost',costControllers.addCost)
module.exports = router