/*On créer le routeur de notre route user qui contient la logique de routing. On importe express
afin d'utiliser sa methode de création de router. On importe nos controllers dans une variable.*/
const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
