const express = require("express")
const router = express.Router()
const categoryController = require('../controllers/categoryController')

router.get('/',categoryController.allCategory)
router.post('/addCategory', categoryController.addCategory)
router.patch('/updateCategory',categoryController.updateCategory)
router.get('/getCategory/:c_ID',categoryController.selectCategory)
module.exports = router