/*On créer le routeur de notre route sauce qui contient la logique de routing. On importe express
afin d'utiliser sa methode de création de router. On importe nos controllers dans une variable.
Puis on importe les middlewares dont on a besoin dans ces routes. On fait attention à l'odre dans lequel
on les places dans la route: auth en premier position pour la sécurité (multer upload des images, il faut les vérifier).*/
const express = require("express");
const router = express.Router();

const saucesCtrl = require("../controllers/sauce");
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

router.get("/", auth, saucesCtrl.getAllSauces);
router.get("/:id", auth, saucesCtrl.getOneSauce);
router.post("/", auth, multer, saucesCtrl.createSauce);
router.post("/:id/like", auth, saucesCtrl.likedSauce);
router.put("/:id", auth, multer, saucesCtrl.modifySauce);
router.delete("/:id", auth, saucesCtrl.deleteSauce);

module.exports = router;
