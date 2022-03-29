/*Ce middleware configure multer. On crée un dictionnaire des types MIME pour définire le format des images.
On lui indique où enregistrer les images. On renomme ensuite les fichiers afin d'avoir des noms uniques:
nom d'origine, auquel on retire les espaces pour les remplacer par des underscores. On rajoute un timeStamp pour l'unicité
et l'extension de notre dictionnaire. 
On exporte le module en lui passant l'objet storage, en précisant que c'est un fichier image unique.
 */
const multer = require("multer");
const mimeTypes = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_");
    const extension = mimeTypes[file.mimetype];
    callback(null, name + Date.now() + "." + extension);
  },
});
module.exports = multer({ storage }).single("image");
