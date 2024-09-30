const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { API_VERSION } = require("./constants");

const app = express();

// Import routings
const authRoutes = require("./router/auth");
const userRoutes = require("./router/user");
const menuRoutes = require("./router/menu");
const courseRoutes = require("./router/course");
const roleRoutes = require("./router/role");
const permissionRoutes = require("./router/permission");
const companyRoutes = require("./router/company");
const siteRoutes = require("./router/site");
const siteFormRoutes = require("./router/siteform");
const energyRoutes = require("./router/energy");
const effluentRoutes = require("./router/effluent");
const productionRoutes = require("./router/production");
const waterRoutes = require("./router/water");
const wasteRoutes = require("./router/waste");
const dangerousRoutes = require("./router/dangerous");
const KPIsRoutes = require("./router/kpis");


// Configure Body Parser
 app.use(bodyParser.urlencoded({ extended: true }));
 app.use(bodyParser.json());

// Configure static folder
 app.use(express.static("uploads"));

// Configure Header HTTP - CORS
app.use(cors());

// Configure routings
app.use(`/api/${API_VERSION}`, authRoutes);
app.use(`/api/${API_VERSION}`, userRoutes);
app.use(`/api/${API_VERSION}`, menuRoutes);
app.use(`/api/${API_VERSION}`, courseRoutes);
app.use(`/api/${API_VERSION}`, roleRoutes);
app.use(`/api/${API_VERSION}`, permissionRoutes);
app.use(`/api/${API_VERSION}`, companyRoutes);
app.use(`/api/${API_VERSION}`, siteRoutes);
app.use(`/api/${API_VERSION}`, siteFormRoutes);
app.use(`/api/${API_VERSION}`, energyRoutes);
app.use(`/api/${API_VERSION}`, effluentRoutes);
app.use(`/api/${API_VERSION}`, productionRoutes);
app.use(`/api/${API_VERSION}`, waterRoutes);
app.use(`/api/${API_VERSION}`, wasteRoutes);
app.use(`/api/${API_VERSION}`, dangerousRoutes);
app.use(`/api/${API_VERSION}`, KPIsRoutes);

module.exports = app;