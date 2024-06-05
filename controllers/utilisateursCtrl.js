const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const regexEmail =
  /^[a-zA-Z0-9.!#$%&'*+\\\/=?^_`{|}~\-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9\-]{2,63}$/;
const regexPassword =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
const modelUtilisateur = require("../models/Utilisateur");
const { check, validationResult } = require('express-validator');

exports.signup = [
  check('pseudo').trim().escape(),
  check('nom').trim().escape(),
  check('prenom').trim().escape(),
  check('email').trim().escape(),
  check('mdp').trim().escape(),
  check('preferences').optional().trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array(), errorCode: 9002 });
    }

    const { pseudo, nom, prenom, email, mdp, preferences} = req.body;
    if (!regexEmail.test(email)) {
      return res
        .status(400)
        .json({ error: "'Please fill in the form fields correctly'", errorCode: 2003 });
    } else if (!regexPassword.test(mdp)) {
      return res.status(400).json({
        error:
          "Your password must contain at least 8 characters, one lower case, one upper case, one number and one special character",
          errorCode: 2004
      });
    } else if (!pseudo || !nom || !prenom || !email || !mdp) {
      return res.status(400).json({ error: "Pseudo, nom, prenom, email et mot de passe sont obligatoires", errorCode: 2006 });
    } else {
      const db = req.db;
      const sel = bcrypt.genSaltSync(10);
      const pwd = mdp;
      const hachage = bcrypt.hashSync(pwd , sel ); 
      // Création d'une instance d'utilisateur avec les données reçues
      const newUtilisateur = new modelUtilisateur(pseudo, nom, prenom, email, hachage, preferences);

      //requête SQL
      const sqlQuery = 'INSERT INTO Utilisateurs (pseudo, nom, prenom, email, mdp, preferences) VALUES (?, ?, ?, ?, ?, ?)';

      // Exécution de la requête
      db.query(sqlQuery, [newUtilisateur.pseudo, newUtilisateur.nom, newUtilisateur.prenom, newUtilisateur.email, newUtilisateur.mdp, newUtilisateur.preferences],(err, results) => {
      if (err) {
        if(err.code == "ER_DUP_ENTRY") {
          return res.status(400).json({error:'l\'email ou le pseudo existe déjà!', errorCode: 2005});
        }
          res.status(500).json({ error: 'Erreur interne du serveur', errorCode: 9000 });
          console.error('Erreur lors de l\'exécution de la requête :', err);
          return;
      } else {
        res.status(200).json({ message: 'Utilisateur créé'});
      }
      });
    }
  }
]


exports.login = [
  check('email').trim().escape(),
  check('mdp').trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      return res.status(400).json({ error: errors.array(), errorCode: 9002});
    }

    const db = req.db;
    const { email, mdp } = req.body;

    if (!email || !mdp) {
      return res.status(400).json({ error: "Email et mot de passe sont requis", errorCode: 2002 });
    }

    const sqlQuery = 'SELECT * FROM utilisateurs WHERE email = ?';
    db.query(sqlQuery, [email], (err, results) => {
      if (err) {
        console.error('Erreur lors de la requête SQL :', err);
        return res.status(500).json({ error: 'Erreur interne du serveur', errorCode: 9000 });
      }

      if (results.length === 0) {
        return res.status(400).json({ error: 'Nom d\'utilisateur/email ou mot de passe incorrect', errorCode: 2000 });
      }

      bcrypt.compare(mdp, results[0].mdp, (err, valid) => {
        if (err) {
          console.error('Erreur lors de la comparaison des mots de passe :', err);
          return res.status(500).json({ error: 'Erreur interne du serveur', errorCode: 9000 });
        }
        if (!valid) {
          return res.status(400).json({ error: 'Nom d\'utilisateur/email ou mot de passe incorrect', errorCode: 2000 });
        }
        const token = jwt.sign(
          { id: results[0].id_utilisateur, isAdmin: results[0].is_admin },
          process.env.JWT_SECRET_KEY,
          { expiresIn: '24h' }
        );

        res.status(200).json({
          id: results[0].id_utilisateur,
          token: token,
          is_admin: results[0].is_admin,
        });
      });
    });
  }
];

exports.modify = [
  check('pseudo').optional().trim().escape(),
  check('nom').optional().trim().escape(),
  check('prenom').optional().trim().escape(),
  check('email').optional().trim().escape(),
  check('preferences').optional().trim().escape(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array(), errorCode: 9002 });
    }

    const db = req.db;
    const { id_utilisateur, pseudo, nom, prenom, email, preferences } = req.body;
    
    let sqlUpdate = 'UPDATE utilisateurs SET';
    const updateValues = [];
    const updateFields = [];

    // Fonction pour ajouter un champ à la requête SQL
    const addFieldToUpdate = (fieldName, fieldValue) => {
      updateFields.push(`${fieldName} = ?`);
      updateValues.push(fieldValue);
    };

    // Utilisation de switch...case pour vérifier chaque champ
    switch (true) {
      case pseudo !== undefined:
        addFieldToUpdate('pseudo', pseudo);
        break;
      case nom !== undefined:
        addFieldToUpdate('nom', nom);
        break;
      case prenom !== undefined:
        addFieldToUpdate('prenom', prenom);
        break;
      case email !== undefined:
        if (regexEmail.test(email.trim())) {
          addFieldToUpdate('email', email);
        } else {
          return res.status(400).send('Email invalide');
        }
        break;
      case preferences !== undefined:
        addFieldToUpdate('preferences', preferences);
        break;
      default:
        return res.status(400).send('Aucune donnée à mettre à jour');
    }

    // Concaténation des champs mis à jour dans la requête SQL
    sqlUpdate += ' ' + updateFields.join(', ');
    sqlUpdate += ' WHERE id_utilisateur = ?';
    updateValues.push(id_utilisateur);

    // Exécution de la requête SQL dynamique
    db.query(sqlUpdate, updateValues, (err, results) => {
      if (err) {
        console.error('Erreur de modification d\'utilisateur :', err);
        return res.status(500).send('Erreur serveur');
      }
      if (results.affectedRows === 0) {
        return res.status(404).send('Utilisateur non trouvé');
      }
      return res.status(200).send('Utilisateur modifié');
    });
  }
];

exports.modifyMdp = [
  check('id_utilisateur').notEmpty().withMessage('id_utilisateur is required'),
  check('mdp').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array(), errorCode: 9002 });
    }
    
    const db=req.db;
    const {id_utilisateur, mdp} = req.body;
    if(!regexPassword.test(mdp.trim())) {
      res.status(400).send('Donnée invalide');
    } else {
      const sel = bcrypt.genSaltSync(10);
      const hachage = bcrypt.hashSync(mdp , sel );
      const sqlUpdate = 'UPDATE utilisateurs SET mdp = ? WHERE id_utilisateur = ?';
      db.query(sqlUpdate, [hachage, id_utilisateur], (err, results) => {
        if (err) {
            console.error('Erreur de changement de mdp:', err);
            res.status(400).send('erreur serveur');
            return;
        }
        if (results.affectedRows === 0) {
            res.status(400).send('utilisateur introuvable');
            return;
        }
        res.status(200).send('Utilisateur modifié');
    });
    }
  }
]

exports.verifyToken = (req, res) => {
  res.status(200).json({ valid: true, userId: req.body.id_utilisateur});
}