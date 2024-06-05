const express=require('express');
const router = express.Router();
const analyticsCtrl = require("../controllers/analyticsCtrl");
const auth = require('../middleware/auth');
const multer = require("../middleware/multer-config");

//Récuperer un article
router.get('/', multer, auth, analyticsCtrl.getAnalytics);

module.exports = router;