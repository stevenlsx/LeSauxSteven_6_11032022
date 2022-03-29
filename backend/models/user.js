/*On créé notre modèle utilisateur qui sera enregistré dans notre BDD. Le package mongoose uniqueValidator 
nous permet de  prévalider les informations. On garantie l'unicité de l'email en utilisant le mot-clé 'unique'.*/
const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
