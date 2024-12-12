const express = require("express");
const multiparty = require("connect-multiparty");
const SiteFormController = require("../controllers/siteform");
const md_auth = require("../middlewares/authenticated");
const md_upload= multiparty({ uploadDir: "./uploads/files" }); 
const fs = require("fs");
const path = require("path");

if (!fs.existsSync("./uploads/files")) {
    fs.mkdirSync("./uploads/files", { recursive: true });
  }

const api = express.Router();

api.get("/siteform/:id", [md_auth.asureAuth], SiteFormController.getSiteForm);
api.get("/siteforms", [md_auth.asureAuth], SiteFormController.getSiteForms);
api.post("/add-siteform", [md_auth.asureAuth], SiteFormController.createSiteForm);
api.put("/update-siteform/:id",[md_auth.asureAuth], SiteFormController.updateSiteForm);
api.delete("/delete-siteform/:id", [md_auth.asureAuth], SiteFormController.deleteSiteForm);
api.get("/siteform-exists-site/:site/:period/:year", [md_auth.asureAuth], SiteFormController.existsSiteFormBySiteAndPeriodAndYear);
api.get("/siteforms-periods-site-year/:site/:year", [md_auth.asureAuth], SiteFormController.getPeriodSiteFormsBySiteAndYear);
api.get("/siteforms-site-year/:site/:year", [md_auth.asureAuth], SiteFormController.getSiteFormsBySiteAndYear);

api.post("/upload-file-siteform/", [md_auth.asureAuth,md_upload], SiteFormController.uploadFile);
api.get("/get-file-siteform/:fileName", SiteFormController.getFile);
api.delete("/delete-file-siteform", SiteFormController.deleteFile);

module.exports = api;
