const express = require("express")
const router = express.Router()
const costControllers = require('../controllers/costControllers')
router.get('/',costControllers.getCost)
router.post('/addCost',costControllers.addCost)
router.patch('/editCost',costControllers.editCost)
module.exports = router