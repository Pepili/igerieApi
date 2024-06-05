exports.createAvis = (req, res) => {
    const db = req.db;
    const avis = req.body.avis;
    const id_article = req.params.id;
    const sqlQuery = 'INSERT INTO avis SET avis = ?, id_article = ?';
    db.query(sqlQuery, [avis, id_article], (err, results) => {
        if (err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return;
        }
        console.log('Résultats de la requête :', results.insertId);
    })
}

exports.getAllAvis = (req, res) => {
    const db = req.db;
    const id_article = req.params.id;
    const sqlQuery = 'SELECT * FROM avis WHERE id_article = ?';
    db.query(sqlQuery, id_article, (err, results) => {
        if (results.length === 0) {
          res.status(401).send("Cet article n'existe pas");
          return;
        } else {
            res.status(200).json(results);
        }
    });
}

exports.deleteAvis = (req, res) => {
    const db = req.db;
    const id_avis = req.params.id; // ID de l'article à supprimer
    const sqlDelete = 'DELETE FROM avis WHERE id_avis = ?';
    db.query(sqlDelete, id_avis, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'avis :', err);
        res.status(500).send('Erreur serveur');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('avis non trouvé');
        return;
      }
      res.status(200).send('Avis supprimé avec succès');
    });
}