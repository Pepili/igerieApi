const express=require('express');
const router = express.Router();
const mailCtrl = require("../controllers/mailCtrl");

//Création d'un avis
router.post('/', mailCtrl.sendMail);

module.exports = router;