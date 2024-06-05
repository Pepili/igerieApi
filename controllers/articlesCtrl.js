const modelArticle = require("../models/Article");
const { body, validationResult, param } = require('express-validator');

function removeAccentsAndLowerCase(str) {
    const accents = 'ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ';
    const accentsOut = 'AAAAAAaaaaaaOOOOOOooooooEEEEeeeeCcIIIIiiiiUUUUuuuuyNn';
    str = str.split('');
    str.forEach((letter, index) => {
        const i = accents.indexOf(letter);
        if (i !== -1) {
            str[index] = accentsOut[i];
        }
    });
    return str.join('').toLowerCase();
}

exports.createArticle = [
    // Validation et nettoyage des champs
    body('titre').trim().escape(),
    body('thematique').trim().escape(),
    body('filtre').optional().customSanitizer(value => removeAccentsAndLowerCase(value)).trim().escape(),
    body('text').optional().trim().escape(),
    body('quote').optional().trim().escape(),
    body('id_utilisateur').trim().escape(),
  
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { titre, thematique, filtre, text, quote, id_utilisateur } = req.body;
      const media = req.file;
      let newArticle;
  
      // Vérification de la présence d'un texte ou d'un média
      if (!(media && media.filename) && !(text && text.trim() !== '')) {
          return res.status(400).json({ error: "Image ou texte obligatoire", errorCode: 4000 });
      }

        // Vérification des autres champs obligatoires
        if (!titre || !thematique || !id_utilisateur) {
            return res.status(400).json({ error: "Titre, Thématique et ID utilisateur sont obligatoires", errorCode: 4001 });
        }
  
      const db = req.db;
      if (media) {
          newArticle = new modelArticle(titre, thematique, filtre, `${req.protocol}://${req.get("host")}/media/images/${media.filename}`, text, quote, id_utilisateur);
      } else {
          newArticle = new modelArticle(titre, thematique, filtre, "", text, quote, id_utilisateur);
      }
  
      // Requête SQL
      const sqlQuery = 'INSERT INTO articles (titre, thematique, filtre, media, text, quote, id_utilisateur) VALUES (?, ?, ?, ?, ?, ?, ?)';
  
      // Exécution de la requête
      db.query(sqlQuery, [newArticle.titre, newArticle.thematique, newArticle.filtre, newArticle.media, newArticle.text, newArticle.quote, newArticle.id_utilisateur], (err, results) => {
          if (err) {
              console.error('Erreur lors de l\'exécution de la requête :', err);
              return res.status(500).json({ error: "Erreur interne du serveur", errorCode: 9000 });
          }
          res.status(200).json({ message: "Article créé avec succès", articleId: results.insertId });
      });
    }
  ];

exports.getAllArticle = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM Articles WHERE date_suppression = ?';
    //execution de la requête
    db.query(sqlQuery, '0000-00-00', (err, results) => {
        if(err) {
            res.status(400).json({error: "erreur serveur", errorCode: 9000});
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return;
        } else if (results.length === 0) {
            return res.status(400).json({error: "Il n'y a actuellement aucun article", errorCode: 3006});
        }
        res.status(200).json(results);
    })
}

exports.getArticlesHome = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM Articles WHERE date_suppression = ? ORDER BY date_creation DESC LIMIT 6';
    db.query(sqlQuery, '0000-00-00', (err, results) => {
        if(err) {
            res.status(500).json({error: "Erreur serveur", errorCode: 9000});
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return;
        } else if (results.length === 0) {
            return res.status(400).json({error: "Il n'y a actuellement aucun article", errorCode: 3006});
        }
        res.status(200).json(results);
    })

}

exports.getOneArticle = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM Articles WHERE id_article = ? AND date_suppression = ?';
    db.query(sqlQuery, [req.params.id , '0000-00-00'], (err, results) => {
        if (results.length === 0) {
        res.status(400).json({error: "Cet article n'existe pas", errorCode: 3003});
          return;
        } else if(err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return res.status(500).json({ error: "Erreur interne du serveur", errorCode: 9000 });
        } else {
            res.status(200).json(results);
        }
    });
}

exports.modifiedArticle = [
    // Validation et nettoyage des champs
    param('id').trim().escape(),
    body('titre').optional().trim().escape(),
    body('thematique').optional().trim().escape(),
    body('filtre').optional().customSanitizer(value => removeAccentsAndLowerCase(value)).trim().escape(),
    body('text').optional().trim().escape(),
    body('quote').optional().trim().escape(),
  
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const db = req.db;
      const articleId = req.params.id; // ID de l'article à modifier
      const { titre, thematique, filtre, text, quote} = req.body; // Nouveau titre et contenu de l'article à partir du corps de la requête
      const media = req.file;
      let sqlUpdate = 'UPDATE articles SET ';
      const valuesToUpdate = [];
      if (titre) {
          sqlUpdate += 'titre = ?, ';
          valuesToUpdate.push(titre);
      }
      if (thematique) {
          sqlUpdate += 'thematique = ?, ';
          valuesToUpdate.push(thematique);
      }
      if (filtre) {
          sqlUpdate += 'filtre = ?, ';
          valuesToUpdate.push(filtre);
      }
      if (media) {
          sqlUpdate += 'media = ?, ';
          valuesToUpdate.push(`${req.protocol}://${req.get("host")}/media/images/${media.filename}`);
      }
      if (text) {
          sqlUpdate += 'text = ?, ';
          valuesToUpdate.push(text);
      }
      if (quote) {
          sqlUpdate += 'quote = ?, ';
          valuesToUpdate.push(quote);
      }
      sqlUpdate = sqlUpdate.slice(0, -2);
      sqlUpdate += ' WHERE id_article = ?';
      valuesToUpdate.push(articleId);
      db.query(sqlUpdate, valuesToUpdate, (err, result) => {
          if (err) {
              console.error('Erreur lors de la modification de l\'article :', err);
              res.status(500).json({error: "Erreur serveur", errorCode: 9000});
              return;
          }
          if (result.affectedRows === 0) {
              res.status(404).json({error: "Article non trouvé", errorCode: 3004});
              return;
          }
          if (media) {
              return res.status(200).json({message: 'Article modifie avec succes', media: `${req.protocol}://${req.get("host")}/media/images/${media.filename}`});
          }
          res.status(200).json({message: 'Article modifie avec succes'});
      });
    }
  ];

exports.deleteArticle = (req, res)=> {
    const db = req.db;
    const articleId = req.params.id; // ID de l'article à supprimer
    const {date_suppression} = req.body;
    const valuesToUpdate = [];
    valuesToUpdate.push(date_suppression);
    valuesToUpdate.push(articleId);
    const sqlDelete = 'UPDATE articles SET date_suppression = ? WHERE id_article = ?';
    db.query(sqlDelete, valuesToUpdate, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'article :', err);
        res.status(500).json({error: "Erreur serveur", errorCode: 9000});
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).json({error: "Article non trouvé", errorCode: 3005});
        return;
      }
      res.status(200).json({message: 'Article supprime avec succes'});
    });
}