const modelAnnexe = require("../models/Annexe");
const { body, validationResult } = require('express-validator');

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

exports.createAnnexe = [
    // Validation et nettoyage des champs
    body('titre').trim().escape(),
    body('thematique').trim().escape(),
    body('filtre').optional().customSanitizer(value => removeAccentsAndLowerCase(value)).trim().escape(),
    body('text').optional().trim().escape(),
    body('quote').optional().trim().escape(),
    body('source').optional().trim().escape(),
    body('id_utilisateur').trim().escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array(), errorCode: 9002 });
        }

        const { titre, thematique, filtre, text, quote, source, id_utilisateur } = req.body;
        const media = req.file;
        let newAnnexe;
        // Vérification de la présence d'un texte ou d'un média
        if (!(media && media.filename) && !(text && text.trim() !== '')) {
            return res.status(400).json({ error: "Image ou texte obligatoire", errorCode: 3000});
        }

        // Vérification des autres champs obligatoires
        if (!titre || !thematique || !id_utilisateur) {
            return res.status(400).json({ error: "Titre, Thématique et ID utilisateur sont obligatoires", errorCode: 3001 });
        }

        const db = req.db;

        if (media) {
            newAnnexe = new modelAnnexe(titre, thematique, filtre, `${req.protocol}://${req.get("host")}/media/images/${media.filename}`, text, quote, source, id_utilisateur);
        } else {
            newAnnexe = new modelAnnexe(titre, thematique, filtre, "", text, quote, source, id_utilisateur);
        }

        // Requête SQL
        const sqlQuery = 'INSERT INTO bibliotheques (titre, thematique, filtre, media, text, quote, source, id_utilisateur) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        db.query(sqlQuery, [newAnnexe.titre, newAnnexe.thematique, newAnnexe.filtre, newAnnexe.media, newAnnexe.text, newAnnexe.quote, newAnnexe.source, newAnnexe.id_utilisateur], (err, results) => {
            if (err) {
                console.error('Erreur lors de l\'exécution de la requête :', err);
                return res.status(500).json({ error: "Erreur interne du serveur", errorCode: 9000 });
            }
            console.log('Nouvel annexe inséré avec l\'ID :', results.insertId);
            res.status(200).json({ message: "Annexe créé avec succès", articleId: results.insertId });
        });
    }
];

exports.getAllAnnexe = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM bibliotheques WHERE date_suppression = ?';
    db.query(sqlQuery, '0000-00-00', (err, results) => {
        if(err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return res.status(500).json({ error: "Erreur serveur", errorCode: 9000 });
        } else if (results.length === 0) {
            return res.status(400).json({error: "Il n'y a actuellement aucun annexe", errorCode: 2003});
        }
        res.status(200).json(results);
    })
}

exports.getOneAnnexe = (req, res) => {
    const db = req.db;
    const sqlQuery = 'SELECT * FROM bibliotheques WHERE id_annexe = ? AND date_suppression = ?';
    db.query(sqlQuery, [req.params.id, '0000-00-00'], (err, results) => {
        if(err) {
            console.error('Erreur lors de l\'exécution de la requête :', err);
            return res.status(500).json({ error: "Erreur interne du serveur", errorCode: 9000 });
        } else if (results.length === 0) {
            res.status(400).json({error: "Cet annexe n'existe pas", errorCode: 2006});
          return;
        } else {
            res.status(200).json(results);
        }
    });
}

exports.modifiedAnnexe = [ 
    // Validation et nettoyage des champs
    body('titre').optional().trim().escape(),
    body('thematique').optional().trim().escape(),
    body('filtre').optional().customSanitizer(value => removeAccentsAndLowerCase(value)).trim().escape(),
    body('text').optional().trim().escape(),
    body('quote').optional().trim().escape(),
    body('source').optional().trim().escape(),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ error: errors.array(), errorCode: 9002 });
        }

        const db = req.db;
        const annexeId = req.params.id;
        const { titre, thematique, filtre, text, source, quote} = req.body;
        const media = req.file;
        let sqlUpdate = 'UPDATE bibliotheques SET ';
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
        if (source) {
            sqlUpdate += 'source = ?, ';
            valuesToUpdate.push(source);
        }
        if (quote) {
            sqlUpdate += 'quote = ?, ';
            valuesToUpdate.push(quote);
        }
        sqlUpdate = sqlUpdate.slice(0, -2);
        sqlUpdate += ' WHERE id_annexe = ?';
        valuesToUpdate.push(annexeId);
        db.query(sqlUpdate, valuesToUpdate, (err, result) => {
            if (err) {
                res.status(500).json({error: "Erreur serveur", errorCode: 9000});
                console.error('Erreur lors de la modification de l\'annexe :', err);
                return;
            }
            if (result.affectedRows === 0) {
                res.status(404).json({error: "Annexe non trouvé", errorCode: 2004});
                return;
            }
            if (media) {
                return res.status(200).json({message: 'Article modifie avec succes', media: `${req.protocol}://${req.get("host")}/media/images/${media.filename}`});
            }
            res.status(200).json({message: 'Annexe modifie avec succes'});
        });
    }
];

exports.deleteAnnexe = (req, res)=> {
    const db = req.db;
    const annexeId = req.params.id;
    const {date_suppression} = req.body;
    console.log(annexeId);
    const valuesToUpdate = [];
    valuesToUpdate.push(date_suppression);
    valuesToUpdate.push(annexeId);
    const sqlDelete = 'UPDATE bibliotheques SET date_suppression = ? WHERE id_annexe = ?';
    db.query(sqlDelete, valuesToUpdate, (err, result) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'annexe :', err);
        res.status(500).json({error: "Erreur serveur", errorCode: 9000});
        return;
      }
      if (result.affectedRows === 0) {
        res.status(404).json({error: "Annexe non trouvé", errorCode: 2005});
        return;
      }
      res.status(200).json({message :'Annexe supprime avec succes'});
    });
}