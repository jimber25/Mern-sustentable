const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const Production = require("../models/production");
const { deleteCompany } = require("./production");
const production = require("../models/production");
const mongoose = require('mongoose');

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

  Production.paginate(filter, options, (error, productions) => {
    if (error) {
      res.status(400).send({ msg: "Error al obtener los formularios de producción" });
    } else {
      res.status(200).send(productions);
    }
  });
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

async function existsProductionFormBySiteAndPeriodAndYear(req, res) {
  const { period, year, site } = req.params;

  Production.find(
    { period: period, year: year, site: site },
    {},
    (error, productions) => {
      if (error) {
        res
          .status(400)
          .send({ msg: "Error al obtener los formularios de produccion" });
      } else {
        if (productions && productions.length > 0) {
          res.status(200).send({ code: 200, exist: true });
        } else {
          res.status(200).send({ code: 200, exist: false });
        }
      }
    }
  );
}

async function getPeriodProductionFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Production.find(
    { year: year, site: site },
    { _id: 0, period: 1 },
    (error, periods) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de produccion de acuerdo al año",
          });
      } else {
        const newData = periods.map((item) => item.period);
        res.status(200).send({ code: 200, periods: newData });
      }
    }
  );
}

async function getProductionFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Production.find(
    {
      $and: [
        { year: { $exists: true, $eq: year } },
        { site: { $exists: true, $eq: site } },
      ],
    },
    {},
    (error, productionForms) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de produccion de acuerdo al año",
          });
      } else {
        res.status(200).send({ code: 200, productionForms: productionForms });
      }
    }
  );
}

function uploadFile(req, res) {
  const file = req.files.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const filePath = path.join("uploads/files", file.name);

  fs.rename(file.path, filePath, (err) => {
    if (err) {
      return res.status(500).send("Failed to upload file.");
    }
    res.status(200).send({code:200,msg:"File uploaded successfully", fileName: filePath});
  });
}

function getFile(req, res) {
    const fileName = req.params.fileName;
    const filePath = "./uploads/files/" + fileName;
    fs.exists(filePath, (exists) => {
      if (!exists) {
        res.status(404).send({ message: "El archivo que buscás no existe" });
      } else {
        res.sendFile(path.resolve(filePath));
      }
    });
}

function deleteFile(req, res) {
  const { fileName } = req.body;

  if (!fileName) {
    return res.status(400).json({ message: 'Se requiere el nombre del archivo' });
  }

  // Define la ruta del archivo
  const filePath = path.join("uploads/files", fileName);

  // Elimina el archivo
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Error al eliminar el archivo' });
    }
    res.status(200).json({ code:200, message: 'Archivo eliminado exitosamente' });
  });
}

module.exports = {
  getProduction,
  getProductions,
  createProduction,
  updateProduction,
  deleteProduction,
  existsProductionFormBySiteAndPeriodAndYear,
  getPeriodProductionFormsBySiteAndYear,
  getProductionFormsBySiteAndYear,
  uploadFile,
  getFile,
  deleteFile
};