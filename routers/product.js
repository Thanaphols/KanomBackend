const express = require("express")
const router = express.Router()
const productController = require('../controllers/productControllers')

router.get('/' , productController.getallProduct)
router.get('/:p_id', productController.getProductID)

router.post('/addProduct', productController.addProduct)

module.exports = router