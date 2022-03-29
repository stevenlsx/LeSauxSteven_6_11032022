/*On créer nos controllers pour la route sauce qui contient la logique metier de notre route*/

const Sauce = require("../models/sauce"); // On importe notre modèle Sauce
const fs = require("fs"); //module permettant gestion des fichiers en local

/*Ce controller permet à l'utilisateur de créer une sauce. On récupère le corps de la requête dans une variable. 
On créé une instance de cette sauce qui contient une copie de la requête et ajoute l'url transformé de l'image
utilisateur. On initialise les compteurs aussi les compteurs de likes puis enregistrent le nouvel objet sauce
dans la BDD.
*/
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  console.log(sauceObject);

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
Avec la methode UpdateOne, on passe sauceObject à l'id de la sauce que l'on modifie pour appliquer les modifs. */
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

/*Ce controller supprime une sauce. On cherche d'abord l'image correspondant à l'id du produit puis on la supprime.
Ensuite on supprime le produit correspondant à l'id produit.*/
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        // () => correspond au 2e argument de unlinkSync, la callback est appelée une fois que l'image a été supprimer.
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce Supprimé" }))
          .catch((error) => res.status(500).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//Ce controller permet de récuperer une unique sauce grace à son id.
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

//Ce controller permet de récuperer la liste de toutes les sauces.
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

/*Ce controller permet d'attribuer un like ou un dislike à une sauce choisie ou de changer son choix
On doit aussi enregistrer l'id de l'utilisateur pour chaque choix afin qu'il ne puisse pas like ou dislike
plusieurs fois. On recupère donc l'id de la sauce, l'id utilisateur et le type de like passer dans
le corps de la requête.*/
exports.likedSauce = (req, res, next) => {
  let userId = req.body.userId;
  let sauceId = req.params.id;
  let like = req.body.like;

  /*Si l'utilisateur like, son nom est ajouté au tableau des user qui ont liké afin qu'il ne puisse plus liké à nouveau 
On incrémente le compteur de like de 1.*/
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

  //Si il dislike on fait de meme avec le tableau des userDislikes et on incrémente le compteur de dislikes de 1.
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
  /*Si l'utilisateur annule son choix, on regarde pour la sauce choisie si son userId figure dans le tableau
  d' userLikes ou si il est dans  celui des userDislikes. il ne reste plus qu'à le retirer de son tableau et
  de décrementer de 1 le compteur associé.*/
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
