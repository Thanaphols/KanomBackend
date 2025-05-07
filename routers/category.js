const express = require("express")
const router = express.Router()
const categoryController = require('../controller/categoryController')

router.get('/',categoryController.allCategory)
router.get('/getCategory/:c_ID',categoryController.selectCategory)
router.post('/addCategory', categoryController.addCategory)
router.patch('/updateCategory',categoryController.updateCategory)

module.exports = router