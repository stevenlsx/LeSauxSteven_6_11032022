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
    userLikes: [],
    userDislikes: [],
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "objet enregistré" }))
    .catch((error) => res.status(400).json({ error }));
};

/*Ce controller permet la modification d'une sauce. la ternaire verifie si la modification comporte une nouvelle image ou non.
Si c'est le cas, on supprime l'ancienne image du serveur puis on ajoute les données modifiés et la nouvelle image a sauceObject.
Si pas le cas, on lui ajoute uniquement les données modifiées. 
Avec la methode UpdateOne, on passe sauceObject à l'id de la sauce que l'on modifie pour appliquer les modifs.  */
exports.modifySauce = (req, res, next) => {
  let sauceObject = {};

  req.file
    ? (Sauce.findOne({
        _id: req.params.id,
      }).then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1]; //Index 1 car 0 correspond a tout ce qu'il y a avant /images/ et 1 car ce qui est après, le fichier qui est à la fin
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

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        // () => correspond au 2e argument de unlinkSync, la callback a appelée une fois que l'image a été supprimer.
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce Supprimé" }))
          .catch((error) => res.status(500).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.likedSauce = (req, res, next) => {
  let userId = req.body.userId;
  let sauceId = req.params.id;
  let like = req.body.like;

  if (like === 1) {
    Sauce.updateOne(
      {
        _id: sauceId,
      },
      {
        $push: {
          userLikes: userId,
        },
        $inc: {
          likes: +1,
        },
      }
    )
      .then(() => res.status(200).json({ message: "Like ajouté" }))
      .catch((error) => res.status(400).json({ error }));
  }
  if (like === -1) {
    Sauce.updateOne(
      {
        _id: sauceId,
      },
      {
        $push: {
          userDislikes: userId,
        },
        $inc: {
          dislikes: +1,
        },
      }
    )
      .then(() => res.status(200).json({ message: "Dislike ajouté" }))
      .catch((error) => res.status(400).json({ error }));
  }
  if (like === 0) {
    Sauce.findOne({ _id: sauceId })
      .then((sauce) => {
        if (sauce.userLikes.includes(userId)) {
          Sauce.updateOne(
            {
              _id: sauceId,
            },
            {
              $pull: {
                userLikes: userId,
              },
              $inc: {
                likes: -1,
              },
            }
          )
            .then(() => res.status(200).json({ message: "Like retiré" }))
            .catch((error) => res.status(400).json({ error }));
        } else if (sauce.userDislikes.includes(userId)) {
          Sauce.updateOne(
            {
              _id: sauceId,
            },
            {
              $pull: {
                userDislikes: userId,
              },
              $inc: {
                dislikes: -1,
              },
            }
          )
            .then(() => res.status(200).json({ message: "disLike retiré" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};
