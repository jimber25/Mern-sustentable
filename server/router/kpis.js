const express = require("express");
const multiparty = require("connect-multiparty");
const KPIsController = require("../controllers/kpis");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.get("/kpis/:id", [md_auth.asureAuth], KPIsController.getKPIs);
api.get("/kpis-forms", [md_auth.asureAuth], KPIsController.getKPIsForms);
api.post("/add-kpis", [md_auth.asureAuth], KPIsController.createKPIs);
api.put("/update-kpis/:id",[md_auth.asureAuth], KPIsController.updateKPIs);
api.delete("/delete-kpis/:id", [md_auth.asureAuth], KPIsController.deleteKPIs);
api.get("/kpis-exists-site/:site/:period/:year", [md_auth.asureAuth], KPIsController.existsKPIsFormBySiteAndPeriodAndYear);
api.get("/kpis-periods-site-year/:site/:year", [md_auth.asureAuth], KPIsController.getPeriodKPIsFormsBySiteAndYear);
api.get("/kpis-site-year/:site/:year", [md_auth.asureAuth], KPIsController.getKPIsFormsBySiteAndYear);

module.exports = api;
