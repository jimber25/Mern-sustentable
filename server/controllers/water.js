const bcrypt = require("bcryptjs");
const Water = require("../models/water");
const { deleteCompany } = require("./company");
const fs = require("fs");
const path = require("path");

async function getWater(req, res) {
  const { id } = req.params;

  const response = await Water.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario del Agua" });
  } else {
    res.status(200).send(response);
  }
}

async function getWaters(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await Water.find();
  } else {
    response = await Water.find({ active });
  }

  res.status(200).send(response);
}

async function createWater(req, res) {
  const water = new Water({ ...req.body, active: true });

  water.save((error, waterStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario del agua" });
    } else {
      res.status(200).send(waterStored);
    }
  });
}

async function updateWater(req, res) {
  const { id } = req.params;
  const Data = req.body;

  Water.findByIdAndUpdate({ _id: id }, waterData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario del agua" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteWater(req, res) {
  const { id } = req.params;

  Water.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario del agua" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

async function existsWaterFormBySiteAndPeriodAndYear(req, res) {
  const { period, year, site } = req.params;

  Water.find(
    { period: period, year: year, site: site },
    {},
    (error, waters) => {
      if (error) {
        res
          .status(400)
          .send({ msg: "Error al obtener los formularios de agua" });
      } else {
        if (waters && waters.length > 0) {
          res.status(200).send({ code: 200, exist: true });
        } else {
          res.status(200).send({ code: 200, exist: false });
        }
      }
    }
  );
}

async function getPeriodWaterFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Water.find(
    { year: year, site: site },
    { _id: 0, period: 1 },
    (error, periods) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de agua de acuerdo al año",
          });
      } else {
        const newData = periods.map((item) => item.period);
        res.status(200).send({ code: 200, periods: newData });
      }
    }
  );
}

async function getWaterFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Water.find(
    {
      $and: [
        { year: { $exists: true, $eq: year } },
        { site: { $exists: true, $eq: site } },
      ],
    },
    {},
    (error, waterForms) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de agua de acuerdo al año",
          });
      } else {
        res.status(200).send({ code: 200, waterForms: waterForms });
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
  getWater,
  getWaters,
  createWater,
  updateWater,
  deleteWater,
  existsWaterFormBySiteAndPeriodAndYear,
  getPeriodWaterFormsBySiteAndYear,
  getWaterFormsBySiteAndYear,
  uploadFile,
  getFile,
  deleteFile
  
};