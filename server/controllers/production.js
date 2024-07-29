const bcrypt = require("bcryptjs");
const Production = require("../models/production");
const { deleteCompany } = require("./production");

async function getProduction(req, res) {
  const { id } = req.params;

  const response = await Production.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario del Produccion" });
  } else {
    res.status(200).send(response);
  }
}

async function getProductions(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await Production.find({});
  } else {
    response = await Production.find({ active });
  }

  res.status(200).send(response);
}

async function createProduction(req, res) {
  const production = new Production({ ...req.body, active: true });

  production.save((error, productionStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario del produccion" });
    } else {
      res.status(200).send(productionStored);
    }
  });
}

async function updateProduction(req, res) {
  const { id } = req.params;
  const productionData = req.body;

  Production.findByIdAndUpdate({ _id: id }, productionData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario del produccion" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteProduction(req, res) {
  const { id } = req.params;

 Production.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario del produccion" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

module.exports = {
  getProduction,
  getProductions,
  createProduction,
  updateProduction,
  deleteProduction
};