const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // on utilise try...catch car de nombreux problème peuvent se produire
  try {
    // on extrait le token du header authorization et on utilise split pour récuper tout ce qui a apres l'espace
    const token = req.headers.authorization.split(" ")[1];
    // verify va décoder le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // on extrait l'id utilisateur du token
    const id_utilisateur = decodedToken.id;
    // si la demande contient un id user, on le compare à celui extrait du token,
    // si ils sont différents, on génère une erreur.
    const id = Number(req.body.id_utilisateur);
    
    if (!id) {
      throw "Il manque l'id_user";
    }
    else if ((id && id !== id_utilisateur)) {
      throw "User ID invalid !";
      // sinon, tout fonctionne et l'user est authentifié
    } else {
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error });
  }
};