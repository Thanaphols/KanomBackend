const express = require("express")
const router = express.Router()
const validateMiddlewere = require('../middleware/validate')
const productController = require('../controllers/productControllers')

router.get('/' ,validateMiddlewere.validateToken,productController.getallProduct)
router.get('/:p_ID', productController.getProductID)
router.patch('/updateProduct', validateMiddlewere.validateToken, productController.updateProduct)
router.post('/addProduct',validateMiddlewere.validateToken, productController.addProduct)
router.delete('/deleteProduct/:p_ID',validateMiddlewere.validateToken,productController.deleteProduct)
module.exports = router