const bcrypt = require("bcryptjs");
const Effluent = require("../models/effluent");
const { deleteCompany } = require("./company");
const mongoose = require('mongoose');

async function getEffluent(req, res) {
  const { id } = req.params;

  const response = await Effluent.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario del efluente" });
  } else {
    res.status(200).send(response);
  }
}

async function getEffluents(req, res) {
  const { active,  page = 1, limit = 50, site } = req.query;

  const filter={}
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      {
        path : 'creator_user',
      },
    ]
  };

  if(active !== undefined){
    options.active=active;
  }
  if(site !== undefined){
    filter.site=mongoose.Types.ObjectId(site);
  }

  Effluent.paginate(filter, options, (error, effluents) => {
    if (error) {
      res.status(400).send({ msg: "Error al obtener los formularios de efluentes" });
    } else {
      res.status(200).send(effluents);
    }
  });
}

async function createEffluent(req, res) {
  const effluent = new Effluent({ ...req.body, active: true });

  effluent.save((error, effluentStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario del efluente" });
    } else {
      res.status(200).send(effluentStored);
    }
  });
}

async function updateEffluent(req, res) {
  const { id } = req.params;
  const effluentData = req.body;

  Effluent.findByIdAndUpdate({ _id: id }, effluentData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario del sitio" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteEffluent(req, res) {
  const { id } = req.params;

  Effluent.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario del efluente" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

module.exports = {
  getEffluent,
  getEffluents,
  createEffluent,
  updateEffluent,
  deleteEffluent,
};
