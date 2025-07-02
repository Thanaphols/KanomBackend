const express = require("express")
const router = express.Router()
const validateMiddlewere = require('../middleware/validate')
const productController = require('../controllers/productControllers')

router.get('/' ,productController.getallProduct)
router.get('/:p_id', productController.getProductID)
router.patch('/updateProduct', validateMiddlewere.validateToken, productController.updateProduct)
router.post('/addProduct',validateMiddlewere.validateToken, productController.addProduct)

module.exports = router