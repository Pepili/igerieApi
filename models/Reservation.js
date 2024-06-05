class Reservation {
    constructor(id_utilisateur, id_service, date_reservation, status) {
        this.id_utilisateur = id_utilisateur;
        this.id_service = id_service;
        this.date_reservation = date_reservation;
        this.status = status;
    }
};

module.exports = Reservation;