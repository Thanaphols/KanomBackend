const express = require("express")
const router = express.Router()
const storeControllers = require('../controllers/storeControllers')

router.get('/',storeControllers.getStore)
router.post('/addStore',storeControllers.addStore)
router.patch('/updateStore/:s_ID', storeControllers.updateStore);
router.delete('/deleteStore/:s_ID', storeControllers.deleteStore);
module.exports = router



