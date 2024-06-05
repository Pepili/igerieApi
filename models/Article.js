class Article {
    constructor(titre, thematique, filtre, media, text, quote, id_utilisateur) {
        this.titre = titre;
        this.thematique = thematique;
        this.filtre = filtre;
        this.media = media;
        this.text = text;
        this.quote = quote;
        this.id_utilisateur = id_utilisateur;
    }
};

module.exports = Article;