const express = require("express")
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const Middlewere = require('../middleware/validate')
router.get('/',categoryController.allCategory)
router.post('/addCategory', Middlewere.validateToken, categoryController.addCategory)
router.patch('/updateCategory',Middlewere.validateToken,categoryController.updateCategory)
router.get('/getCategory/:c_ID',Middlewere.validateToken,categoryController.selectCategory)
router.get('/getCategoryCount/',Middlewere.validateToken,categoryController.getCategoryWithCount)
router.delete('/deleteCategory/:c_ID',Middlewere.validateToken,categoryController.deleteCategory)

module.exports = router