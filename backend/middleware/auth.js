/*Ce middleware de sécurité récupère le token dans le header de la requête.
1ere verif: On vérifie sa validité avec la chaîne secrète que l'on a stocké dans notre variable environnement
2e verif: On vérifie que le corps de la requête possède bien un id et si il y en a un on le compare à celui
recuperer dans le token pour vérifier si ce sont les mêmes.*/
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN);

    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "UserId non valable";
    } else {
      next();
    }
  } catch {
    res.status(401).json({ error: "Invalid request" });
  }
};
