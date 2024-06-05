const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');
// donne accès au chemin du système de fichier
const path = require("path");
const app = express();
const articleRoutes = require("./routes/articles");
const userRoutes = require("./routes/utilisateurs");
const avisRoutes = require("./routes/avis");
const reservationRoutes = require("./routes/reservations");
const serviceRoutes = require("./routes/services");
const annexeRoutes = require("./routes/annexes");
const mailRoutes = require("./routes/mail");
const analyticsRoutes = require("./routes/analytics");
const mysql = require('mysql');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

// Augmenter la limite de taille de la requête
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

/* Ces headers permettent d'accéder à l'API depuis n'importe quelle origine,
d'ajouter les headers aux requêtes envoyées vers l'API,
d'envoyer des requêtes avec les méthodes indiquées */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  req.db = connection;
  next();
});

app.use(express.json());
// indique à express de gérer la ressource images de manière statique à chaque requête vers /images
/* app.use("/images", express.static(path.join(__dirname, "media/images"))); */
app.use("/media/images", express.static(path.join(__dirname, "media/images")));
app.use("/api/reservations", reservationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/utilisateurs", userRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/avis", avisRoutes);
app.use("/api/annexes", annexeRoutes);
app.use("/api/mail", mailRoutes)
app.use("/api/analytics", analyticsRoutes)
module.exports = app;