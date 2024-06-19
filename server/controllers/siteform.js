const bcrypt = require("bcryptjs");
const SiteForm = require("../models/siteform");
const { deleteCompany } = require("./company");

async function getSiteForm(req, res) {
  const { id } = req.params;

  const response = await SiteForm.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario del Sitio" });
  } else {
    res.status(200).send(response);
  }
}

async function getSiteForms(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await SiteForm.find();
  } else {
    response = await SiteForm.find({ active });
  }

  res.status(200).send(response);
}

async function createSiteForm(req, res) {
  const siteForm = new SiteForm({ ...req.body, active: true });

  siteForm.save((error, siteFormStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario del sitio" });
    } else {
      res.status(200).send(siteFormStored);
    }
  });
}

async function updateSiteForm(req, res) {
  const { id } = req.params;
  const siteFormData = req.body;

  SiteForm.findByIdAndUpdate({ _id: id }, siteFormData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario del sitio" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteSiteForm(req, res) {
  const { id } = req.params;

  SiteForm.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario del sitio" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

module.exports = {
  getSiteForm,
  getSiteForms,
  createSiteForm,
  updateSiteForm,
  deleteSiteForm,
};