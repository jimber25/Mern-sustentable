const express = require("express");
const multiparty = require("connect-multiparty");
const DangerousController = require("../controllers/dangerous");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.get("/dangerous/:id", [md_auth.asureAuth], DangerousController.getDangerous);
api.get("/dangerous-forms", [md_auth.asureAuth], DangerousController.getDangerousForms);
api.post("/add-dangerous", [md_auth.asureAuth], DangerousController.createDangerous);
api.put("/update-dangerous/:id",[md_auth.asureAuth], DangerousController.updateDangerous);
api.delete("/delete-dangerous/:id", [md_auth.asureAuth], DangerousController.deleteDangerous);
api.get("/dangerous-exists-site/:site/:period/:year", [md_auth.asureAuth], DangerousController.existsDangerousFormBySiteAndPeriodAndYear);
api.get("/dangerous-periods-site-year/:site/:year", [md_auth.asureAuth], DangerousController.getPeriodDangerousFormsBySiteAndYear);
api.get("/dangerous-site-year/:site/:year", [md_auth.asureAuth], DangerousController.getDangerousFormsBySiteAndYear);

module.exports = api;
