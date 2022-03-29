//Import d'Express et création de notre application Express.
const express = require("express");
const app = express();
//Permet de parser les requêtes avant des les injecter le corps de la requête.
app.use(express.json());

//Plugin qui sert dans la gestion de chemin de fichier/dossier
const path = require("path");

//Import des routes sauce et user depuis le dossier routes.
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

/*Import puis initialisation de Helmet, un package de sécurité configurant les en-têtes HTTP. 
Modifiant d'un comportement par default bloquant du système de sécurité CORP de Helmet, empechant
 le cross-plateform de certains fichiers. */
const helmet = require("helmet");
app.use(helmet({ crossOriginResourcePolicy: false }));

//Import de dotenv afin de pouvoir stocker les données sensibles dans des variables envrionnements.
const dotenv = require("dotenv");
dotenv.config();

//Plugin pour se connecter à la BDD
const mongoose = require("mongoose");
//Connection a la BDD, sécurisée à l'aide de la varibale envrionnement DB.
mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

/*Middleware configurant les headers afin de contourner les erreurs bloquantes
de la sécurité CORS pour que tout le monde puisse requêter depuis sa machine.*/
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
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

//Middleware permettant d'initialiser le dossier qui va stocker les images upload par les utilisateurs.
app.use("/images", express.static(path.join(__dirname, "images")));

//Utilisation des routes complétes grâce à leur import depuis le dossier routes.
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

//Encapsule notre code pour le rendre disponible à d'autres fichiers.
module.exports = app;
