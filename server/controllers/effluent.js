const bcrypt = require("bcryptjs");
const Effluent = require("../models/effluent");
const { deleteCompany } = require("./company");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

async function getEffluent(req, res) {
  const { id } = req.params;

  const response = await Effluent.findById(id);
  if (!response) {
    res
      .status(400)
      .send({ msg: "No se ha encontrado el formulario del efluente" });
  } else {
    res.status(200).send(response);
  }
}

async function getEffluents(req, res) {
  const { active, page = 1, limit = 50, site } = req.query;

  const filter = {};
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    populate: [
      {
        path: "creator_user",
      },
    ],
  };

  if (active !== undefined) {
    options.active = active;
  }
  if (site !== undefined) {
    filter.site = mongoose.Types.ObjectId(site);
  }

  Effluent.paginate(filter, options, (error, effluents) => {
    console.log(error);
    if (error) {
      res
        .status(400)
        .send({ msg: "Error al obtener los formularios de efluentes" });
    } else {
      res.status(200).send(effluents);
    }
  });
}

async function createEffluent(req, res) {
  const effluent = new Effluent({ ...req.body, active: true });

  effluent.save((error, effluentStored) => {
    if (error) {
      res
        .status(400)
        .send({ msg: "Error al crear el formulario del efluente" });
    } else {
      res.status(200).send(effluentStored);
    }
  });
}

async function updateEffluent(req, res) {
  const { id } = req.params;
  const effluentData = req.body;

  Effluent.findByIdAndUpdate({ _id: id }, effluentData, (error, response) => {
    if (error) {
      res
        .status(400)
        .send({ msg: "Error al actualizar el formulario del sitio" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteEffluent(req, res) {
  const { id } = req.params;

  Effluent.findByIdAndDelete(id, (error) => {
    if (error) {
      res
        .status(400)
        .send({ msg: "Error al eliminar el formulario del efluente" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

async function existsEffluentFormBySiteAndPeriodAndYear(req, res) {
  const { period, year, site } = req.params;

  Effluent.find(
    { period: period, year: year, site: site },
    {},
    (error, effluents) => {
      if (error) {
        res
          .status(400)
          .send({ msg: "Error al obtener los formularios de efluentes" });
      } else {
        if (effluents && effluents.length > 0) {
          res.status(200).send({ code: 200, exist: true });
        } else {
          res.status(200).send({ code: 200, exist: false });
        }
      }
    }
  );
}

async function getPeriodEffluentFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Effluent.find(
    { year: year, site: site },
    { _id: 0, period: 1 },
    (error, periods) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de efluentes de acuerdo al año",
          });
      } else {
        const newData = periods.map((item) => item.period);
        res.status(200).send({ code: 200, periods: newData });
      }
    }
  );
}

async function getEffluentFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Effluent.find(
    {
      $and: [
        { year: { $exists: true, $eq: year } },
        { site: { $exists: true, $eq: site } },
      ],
    },
    {},
    (error, effluentForms) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de efluentes de acuerdo al año",
          });
      } else {
        res.status(200).send({ code: 200, effluentForms: effluentForms });
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
  getEffluent,
  getEffluents,
  createEffluent,
  updateEffluent,
  deleteEffluent,
  existsEffluentFormBySiteAndPeriodAndYear,
  getPeriodEffluentFormsBySiteAndYear,
  getEffluentFormsBySiteAndYear,
  uploadFile,
  getFile,
  deleteFile
}
