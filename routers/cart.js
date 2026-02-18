const express = require("express")
const router = express.Router()
const cartController = require('../controllers/cartControllers')
const Middlewere = require('../middleware/validate')
router.post('/addCart' , Middlewere.validateToken,cartController.addCart)

module.exports = router