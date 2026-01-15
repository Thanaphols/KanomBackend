const express = require("express")
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const validateMiddlewere = require('../middleware/validate')
router.get('/',categoryController.allCategory)
router.post('/addCategory', validateMiddlewere.validateToken, categoryController.addCategory)
router.patch('/updateCategory',validateMiddlewere.validateToken,categoryController.updateCategory)
router.get('/getCategory/:c_ID',categoryController.selectCategory)
router.get('/getCategoryCount/',categoryController.getCategoryWithCount)
router.delete('/deleteCategory/:c_ID',validateMiddlewere.validateToken,categoryController.deleteCategory)

module.exports = router