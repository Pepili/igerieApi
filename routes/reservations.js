const express=require('express');
const router = express.Router();
const reservationCtrl = require("../controllers/reservationsCtrl");
const auth = require('../middleware/auth');

//Création d'une reservation
router.post('/', auth, reservationCtrl.createReservation);

//Récuperer toutes les reservations
router.get('/', auth, reservationCtrl.getAllReservation);

//Récuperer une reservation
router.get('/:id', auth, reservationCtrl.getOneReservation);

//Modifier une reservation
router.put('/:id',auth,  reservationCtrl.modifiedReservation);

//Supprimer une reservation
router.delete('/:id', auth, reservationCtrl.deleteReservation);

module.exports = router;