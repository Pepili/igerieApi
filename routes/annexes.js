const express=require('express');
const router = express.Router();
const annexeCtrl = require("../controllers/annexeCtrl");
const auth = require('../middleware/auth');
const multer = require("../middleware/multer-config");

//Création d'article
router.post('/', multer, auth, annexeCtrl.createAnnexe);

//Récuperer tout les articles
router.get('/', annexeCtrl.getAllAnnexe);

//Récuperer un article
router.get('/:id', annexeCtrl.getOneAnnexe);

//Modifier un article
router.put('/:id', multer, auth, annexeCtrl.modifiedAnnexe);

//Supprimer un article
router.put('/delete/:id', multer, auth, annexeCtrl.deleteAnnexe);

module.exports = router;