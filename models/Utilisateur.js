class Utilisateur {
    constructor(pseudo, nom, prenom, email, mdp, preferences) {
        this.pseudo = pseudo;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.mdp = mdp;
        this.preferences= preferences;
    }
};

module.exports = Utilisateur;