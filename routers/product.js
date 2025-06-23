const express = require("express")
const router = express.Router()
const Middlewere = require('../middleware/validate')
const productController = require('../controllers/productControllers')

router.get('/' ,productController.getallProduct)
router.get('/:p_id', productController.getProductID)
router.patch('/updateProduct', productController.updateProduct)
router.post('/addProduct', productController.addProduct)

module.exports = router