const express = require("express")
const router = express.Router()
const Middlewere = require('../middleware/validate')
const productController = require('../controllers/productControllers')

router.get('/' , Middlewere.validateToken,productController.getallProduct)
router.get('/:p_id', productController.getProductID)

router.post('/addProduct', productController.addProduct)

module.exports = router