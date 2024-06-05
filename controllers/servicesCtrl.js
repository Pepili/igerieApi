const modelService = require("../models/Service");
const regex =
  /^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ' -]{2,33}$/;
  const regexDescription =
  /^[a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ' -]{2,80}$/;

exports.createService = (req, res) => {
    const { nom, presentation, prix } = req.body;
    if(!regex.test(nom.trim()) || !regexDescription.test(presentation.trim()) || !prix.trim()) {
        return res
            .status(400)
            .json({error: "'Il manque des données'"});
    } else {
        const db = req.db;
        // Création d'une instance d'utilisateur avec les données reçues
        const newService = new modelService(nom, presentation, prix);
        //requête SQL
        const sqlQuery = 'INSERT INTO services (nom, presentation, prix) VALUES (?, ?, ?)';
        //execution de la requête
        db.query(sqlQuery, [newService.nom, newService.presentation, newService.prix],(err, results) => {
            if (err) {
                console.error('Erreur lors de l\'exécution de la requête :', err);
                return;
            }
            console.log('Résultats de la requête :', results.insertId);
        })
    }
}

exports.getAllServices = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM services';
    //execution de la requête
    db.query(sqlQuery, (err, results) => {
        if(err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return;
        }
        res.status(200).json(results);
    })
}

exports.getOneService = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM services WHERE id_service = ?';
    db.query(sqlQuery, req.params.id, (err, results) => {
        if (results.length === 0) {
          res.status(401).send("Ce service n'existe pas");
          return;
        } else {
            res.status(200).json(results);
        }
    });
}

exports.deleteService = (req, res) => {
    const db = req.db;
    const sqlDelete = 'DELETE FROM services WHERE id_service = ?';
    db.query(sqlDelete, req.params.id, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression du service :', err);
        res.status(500).send('Erreur serveur');
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).send('service non trouvé');
        return;
      }
      res.status(200).send('Service supprimé avec succès');
    });
}