const express=require('express');
const router = express.Router();
const userCtrl = require("../controllers/utilisateursCtrl");
const auth = require('../middleware/auth');

//Création d'un utilisateur
router.post('/', userCtrl.signup);

//connexion utilisateur
router.post('/login', userCtrl.login);

//Modification des données de l'utilisateur
router.put('/', auth, userCtrl.modify);

//Modification mdp
router.put('/mdp', auth, userCtrl.modifyMdp);

//Verification token
router.post('/verifyToken', auth, userCtrl.verifyToken);

module.exports= router;