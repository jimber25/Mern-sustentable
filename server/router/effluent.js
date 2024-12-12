const express = require("express");
const multiparty = require("connect-multiparty");
const EffluentController = require("../controllers/effluent");
const md_auth = require("../middlewares/authenticated");
const md_upload= multiparty({ uploadDir: "./uploads/files" }); 
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("./uploads/files")) {
    fs.mkdirSync("./uploads/files", { recursive: true });
  }

const api = express.Router();

api.get("/effluent/:id", [md_auth.asureAuth], EffluentController.getEffluent);
api.get("/effluents", [md_auth.asureAuth], EffluentController.getEffluents);
api.post("/add-effluent", [md_auth.asureAuth], EffluentController.createEffluent);
api.put("/update-effluent/:id",[md_auth.asureAuth], EffluentController.updateEffluent);
api.delete("/delete-effluent/:id", [md_auth.asureAuth], EffluentController.deleteEffluent);
api.get("/effluent-exists-site/:site/:period/:year", [md_auth.asureAuth], EffluentController.existsEffluentFormBySiteAndPeriodAndYear);
api.get("/effluents-periods-site-year/:site/:year", [md_auth.asureAuth], EffluentController.getPeriodEffluentFormsBySiteAndYear);
api.get("/effluents-site-year/:site/:year", [md_auth.asureAuth], EffluentController.getEffluentFormsBySiteAndYear);

api.post("/upload-file-effluent/", [md_auth.asureAuth,md_upload], EffluentController.uploadFile);
api.get("/get-file-effluent/:fileName", EffluentController.getFile);
api.delete("/delete-file-effluent", EffluentController.deleteFile);

module.exports = api;
