const express = require("express");
const multiparty = require("connect-multiparty");
const EffluentController = require("../controllers/effluent");
const md_auth = require("../middlewares/authenticated");

const api = express.effluent();

api.get("/effluent/:id", [md_auth.asureAuth], EffluentController.getEffluent);
api.get("/effluents", [md_auth.asureAuth], EffluentController.getEffluents);
api.post("/add-effluent", [md_auth.asureAuth], EffluentsController.createEffluent);
api.put("/update-effluent/:id",[md_auth.asureAuth], EffluentController.updateEffluent);
api.delete("/delete-effluent/:id", [md_auth.asureAuth], EffluentController.deleteEffluent);

module.exports = api;
