const express=require('express');
const router = express.Router();
const articleCtrl = require("../controllers/articlesCtrl");
const auth = require('../middleware/auth');
const multer = require("../middleware/multer-config");

//Création d'article
router.post('/', multer, auth,  articleCtrl.createArticle);

//Récuperer tout les articles
router.get('/', articleCtrl.getAllArticle);

// Récupère les 4 derniers articles ajoutés
router.get('/home', articleCtrl.getArticlesHome);

//Récuperer un article
router.get('/:id', articleCtrl.getOneArticle);

//Modifier un article
router.put('/:id', multer, auth, articleCtrl.modifiedArticle);

//Supprimer un article
router.put('/delete/:id', multer, auth, articleCtrl.deleteArticle);

module.exports = router;