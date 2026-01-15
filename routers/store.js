const express = require("express")
const router = express.Router()
const storeControllers = require('../controllers/storeControllers')

router.get('/',storeControllers.getStore)
router.post('/addStore',storeControllers.addStore)
module.exports = router



