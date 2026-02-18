const express = require("express")
const router = express.Router()
const Middlewere = require('../middleware/validate')
const productController = require('../controllers/productControllers')

router.get('/' ,Middlewere.validateToken,productController.getallProduct)
router.get('/:p_ID', Middlewere.validateToken,productController.getProductID)
router.patch('/updateProduct', Middlewere.validateToken, productController.updateProduct)
router.post('/addProduct',Middlewere.validateToken, productController.addProduct)
router.delete('/deleteProduct/:p_ID',Middlewere.validateToken,productController.deleteProduct)
module.exports = router