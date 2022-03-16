const Sauce = require("../models/sauce");
const fs = require("fs");

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);

  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "objet enregistré" }))
    .catch((error) => res.status(400).json({ error }));
};

/*Ce middleware permet la modification d'une sauce. la ternaire verifie si la modification comporte une nouvelle image ou non.
Si c'est le cas, on supprime l'ancienne image du serveur puis on ajoute les données modifiés et la nouvelle image a sauceObject.
Si pas le cas, on lui ajoute uniquement les données modifiées. 
Avec la methode UpdateOne, on passe sauceObject à l'id de la sauce que l'on modifie pour appliquer les modifs.  */
exports.modifySauce = (req, res, next) => {
  let sauceObject = {};

  req.file
    ? (Sauce.findOne({
        _id: req.params.id,
      }).then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlinkSync(`images/${filename}`);
      }),
      (sauceObject = {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }))
    : (sauceObject = {
        ...req.body,
      });
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((thing) => res.status(200).json(thing))
    .catch((error) => res.status(404).json({ error }));
};
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};
