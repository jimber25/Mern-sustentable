const express = require("express");
const multiparty = require("connect-multiparty");
const WasteController = require("../controllers/waste");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.get("/waste/:id", [md_auth.asureAuth], WasteController.getWaste);
api.get("/wastes", [md_auth.asureAuth], WasteController.getWaste);
api.post("/add-waste", [md_auth.asureAuth], WasteController.createWaste);
api.put("/update-waste/:id",[md_auth.asureAuth], WasteController.updateWaste);
api.delete("/delete-waste/:id", [md_auth.asureAuth], WasteController.deleteWaste);
api.get("/wastes-exists-site/:site/:period/:year", [md_auth.asureAuth], WasteController.existsWasteFormBySiteAndPeriodAndYear);
api.get("/wastes-periods-site-year/:site/:year", [md_auth.asureAuth], WasteController.getPeriodWasteFormsBySiteAndYear);
api.get("/wastes-site-year/:site/:year", [md_auth.asureAuth], WasteController.getWasteFormsBySiteAndYear);

module.exports = api;
