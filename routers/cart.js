const express = require("express")
const router = express.Router()
const cartController = require('../controllers/cartControllers')
const validateMiddlewere = require('../middleware/validate')
router.post('/addCart' , validateMiddlewere.validateToken,cartController.addCart)

module.exports = router