/*On créer nos controllers pour la route user qui contient la logique metier de notre route*/

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user"); //On importe notre modèle utilisateur User
const dotenv = require("dotenv");
dotenv.config();

/* Ce middleware permet la création d'un utilisateur dans la BDD. On crypte le mot de passe
 en demandant à bcrypt de passer 10 fois dessus, puis on créé une nouvelle instance de l'user
qui contient son mdp crypté. Si aucune erreur, on enregistre cette instance dans la BDD */
exports.signup = (req, res, next) => {
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
};

/*Ce middleware permet la connexion. On verfie si l'adresse mail envoyer dans la requête correspond à une adresse mail existante.
Si oui, on compare le mdp envoyé dans la requête avec le hash du mdp enregistré dans la BDD. Sinon, erreur 401.
Si mdp valide, on renvois au frontend  un token qui encode l'userId, une variable envrionnement qui contient une string secrète et une durée de validité du token.
Encoder l'user ID dans notre token permet à l'utilisateur de ne modifier que ses propres objets. */
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
            token: jwt.sign({ userId: user._id }, process.env.TOKEN, {
              expiresIn: "24h",
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};
