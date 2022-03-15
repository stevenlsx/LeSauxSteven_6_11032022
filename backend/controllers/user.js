const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

/* Ce middleware permet l'inscription. Il verifie d'abord si l'adresse mail existe ou non.
 Si elle n'existe pas alors on crypte le mot de passe, puis on créé une nouvelle instance de l'user qui contient son mdp crypté.
 Si aucune erreur, on enregistre cette instance dans la BDD */
exports.signup = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (user) {
        return res
          .status(403)
          .json({ message: "Cet adresse mail existe déja !" });
      } else {
        bcrypt
          .hash(req.body.password, 10)
          .then((hash) => {
            const user = new User({
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then(() => res.status(201).json({ message: "Utilisateur créé" }))
              .catch((error) => res.status(400).json({ error }));
          })
          .catch((error) => res.status(500).json({ error }));
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

/*Ce middleware permet la connexion. On verfie si l'adresse mail envoyer dans la requête correspond à une adresse mail existante.
Si c'est le cas, alors on compare le mdp envoyé dans la requête avec le hash du mdp enregistré dans la BDD.
Si c'est valide,on renvois au frontend  un token qui encode l'userId, une string secrète et une durée de validité du token
Encoder l'user ID pdans notre token permet de verifier que l'on possède le bon userId pour modifier ses objets et pas ceux des autres utilisateurs */
exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      bcrypt
        .compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) {
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, "Token_Secret_Test", {
              expiresIn: "24",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
