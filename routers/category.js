const express = require("express")
const router = express.Router()
const categoryController = require('../controllers/categoryController')

router.get('/',categoryController.allCategory)
router.post('/addCategory', categoryController.addCategory)
router.patch('/updateCategory',categoryController.updateCategory)
router.get('/getCategory/:c_ID',categoryController.selectCategory)
router.delete('/deleteCategory/:c_ID',categoryController.deleteCategory)
module.exports = router