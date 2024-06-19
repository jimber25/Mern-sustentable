const express = require("express");
const multiparty = require("connect-multiparty");
const SiteFormController = require("../controllers/siteform");
const md_auth = require("../middlewares/authenticated");

const api = express.Router();

api.get("/siteform/:id", [md_auth.asureAuth], SiteFormController.getSiteForm);
api.get("/siteforms", [md_auth.asureAuth], SiteFormController.getSiteForms);
api.post("/add-siteform", [md_auth.asureAuth], SiteFormController.createSiteForm);
api.put("/update-siteform/:id",[md_auth.asureAuth], SiteFormController.updateSiteForm);
api.delete("/delete-siteform/:id", [md_auth.asureAuth], SiteFormController.deleteSiteForm);

module.exports = api;
