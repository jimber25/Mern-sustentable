const bcrypt = require("bcryptjs");
const Waste = require("../models/waste");
const { deleteCompany } = require("./company");
const fs = require("fs");
const path = require("path");

async function getWaste(req, res) {
  const { id } = req.params;

  const response = await Waste.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario de Agua" });
  } else {
    res.status(200).send(response);
  }
}

async function getWastes(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await Waste.find();
  } else {
    response = await Waste.find({ active });
  }

  res.status(200).send(response);
}

async function createWaste(req, res) {
  const waste = new Waste({ ...req.body, active: true });

  waste.save((error, waterStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario de residuos" });
    } else {
      res.status(200).send(waterStored);
    }
  });
}

async function updateWaste(req, res) {
  const { id } = req.params;
  const Data = req.body;

  Waste.findByIdAndUpdate({ _id: id }, waterData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario de residuos" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteWaste(req, res) {
  const { id } = req.params;

  Waste.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario de residuos" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

async function existsWasteFormBySiteAndPeriodAndYear(req, res) {
  const { period, year, site } = req.params;

  Waste.find(
    { period: period, year: year, site: site },
    {},
    (error, wastes) => {
      if (error) {
        res
          .status(400)
          .send({ msg: "Error al obtener los formularios de residuos" });
      } else {
        if (wastes && wastes.length > 0) {
          res.status(200).send({ code: 200, exist: true });
        } else {
          res.status(200).send({ code: 200, exist: false });
        }
      }
    }
  );
}

async function getPeriodWasteFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Waste.find(
    { year: year, site: site },
    { _id: 0, period: 1 },
    (error, periods) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de residuos de acuerdo al año",
          });
      } else {
        const newData = periods.map((item) => item.period);
        res.status(200).send({ code: 200, periods: newData });
      }
    }
  );
}

async function getWasteFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Waste.find(
    {
      $and: [
        { year: { $exists: true, $eq: year } },
        { site: { $exists: true, $eq: site } },
      ],
    },
    {},
    (error, wasteForms) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de residuos de acuerdo al año",
          });
      } else {
        res.status(200).send({ code: 200, wasteForms: wasteForms });
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
  getWaste,
  getWastes,
  createWaste,
  updateWaste,
  deleteWaste,
  existsWasteFormBySiteAndPeriodAndYear,
  getPeriodWasteFormsBySiteAndYear,
  getWasteFormsBySiteAndYear,
  uploadFile,
  getFile,
  deleteFile
};