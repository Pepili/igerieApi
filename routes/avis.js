const express=require('express');
const router = express.Router();
const avisCtrl = require("../controllers/avisCtrl");
const auth = require('../middleware/auth');

//Création d'un avis
router.post('/:id', auth, avisCtrl.createAvis);

//Récupération des avis d'un article
router.get('/:id', avisCtrl.getAllAvis);

//Suppression d'un avis
router.delete('/:id', auth, avisCtrl.deleteAvis);

module.exports = router;