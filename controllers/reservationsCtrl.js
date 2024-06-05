const modelReservation = require("../models/Reservation");

exports.createReservation = (req, res) => {
    const { id_utilisateur, id_service, date_reservation} = req.body;
    const status = "WAIT";
    const db = req.db;
    // Création d'une instance d'utilisateur avec les données reçues
    const newReservation = new modelReservation(id_utilisateur, id_service, date_reservation, status);
    //requête SQL
    const sqlQuery = 'INSERT INTO reservations (id_utilisateur, id_service, date_reservation, status) VALUES (?, ?, ?, ?)';
    //execution de la requête
    db.query(sqlQuery, [newReservation.id_utilisateur, newReservation.id_service, newReservation.date_reservation, newReservation.status],(err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return;
        }
        console.log('Résultats de la requête :', results.insertId);
    })
}

exports.getAllReservation = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM reservations';
    //execution de la requête
    db.query(sqlQuery, (err, results) => {
        if(err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return;
        }
        res.status(200).json(results);
    })
}

exports.getOneReservation = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM reservations WHERE id_reservation = ?';
    db.query(sqlQuery, req.params.id, (err, results) => {
        if (results.length === 0) {
          res.status(401).send("Cette reservation n'existe pas");
          return;
        } else {
            res.status(200).json(results);
        }
    });
}

exports.modifiedReservation = (req, res) => {
    const db = req.db;
    const id_reservation = req.params.id; // ID de l'article à modifier
    const {date_reservation, status} = req.body;
    // Requête SQL pour mettre à jour l'article avec les nouvelles valeurs
    let sqlUpdate = 'UPDATE reservations SET';
    const updateValues = [];
    const updateFields = [];
  
    // Fonction pour ajouter un champ à la requête SQL
    const addFieldToUpdate = (fieldName, fieldValue) => {
      updateFields.push(`${fieldName} = ?`);
      updateValues.push(fieldValue);
    };
  
    // Utilisation de switch...case pour vérifier chaque champ
    switch (true) {
      case date_reservation !== undefined:
        addFieldToUpdate('date_reservation', date_reservation);
        break;
      case status !== undefined:
        addFieldToUpdate('status', status);
        break;
      default:
        return res.status(400).send('Aucune donnée à mettre à jour');
    }
  
    // Concaténation des champs mis à jour dans la requête SQL
    sqlUpdate += ' ' + updateFields.join(', ');
    sqlUpdate += ' WHERE id_reservation = ?';
    updateValues.push(id_reservation);

     db.query(sqlUpdate, updateValues, (err, result) => {
        if (err) {
            console.error('Erreur lors de la modification de la reservation :', err);
            res.status(500).send('Erreur serveur');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('reservation non trouvée');
            return;
        }
        res.status(200).send('Reservation modifiée avec succès');
  });
}

exports.deleteReservation = (req, res) =>{
    const db = req.db;
    const reservationId = req.params.id; // ID de l'article à supprimer
    const sqlDelete = 'DELETE FROM reservations WHERE id_reservation = ?';
    db.query(sqlDelete, reservationId, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de la reservation :', err);
        res.status(500).send('Erreur serveur');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('Reservation non trouvé');
        return;
      }
      res.status(200).send('Reservation supprimé avec succès');
    });
}