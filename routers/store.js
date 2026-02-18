const express = require("express")
const router = express.Router()
const storeControllers = require('../controllers/storeControllers')
const Middlewere = require('../middleware/validate')
router.get('/',Middlewere.validateToken,storeControllers.getStore)
router.post('/addStore',Middlewere.validateToken,storeControllers.addStore)
router.patch('/updateStore/:s_ID', Middlewere.validateToken,storeControllers.updateStore);
router.delete('/deleteStore/:s_ID', Middlewere.validateToken, storeControllers.deleteStore);
module.exports = router



