const express=require('express');
const router = express.Router();
const serviceCtrl = require("../controllers/servicesCtrl");
const auth = require('../middleware/auth');

//Création des services
router.post('/', auth, serviceCtrl.createService);

//Récuperer tout les services
router.get('/', serviceCtrl.getAllServices);

//Récuperer un service
router.get('/:id', serviceCtrl.getOneService);

//Supprimer un service
router.delete('/:id', auth, serviceCtrl.deleteService);
module.exports = router;