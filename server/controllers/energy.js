const bcrypt = require("bcryptjs");
const Energy = require("../models/energy");
const fs = require("fs");
const path = require("path");

async function getEnergy(req, res) {
  const { id } = req.params;
        
  const response = await Energy.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario del Energia" });
  } else {
    res.status(200).send(response);
    
  }

}

async function getEnergies(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await Energy.find();
  } else {
    response = await Energy.find({ active });
  }

  res.status(200).send(response);
}

async function createEnergy(req, res) {
  const energy = new Energy({ ...req.body, active: true });

  energy.save((error, energyStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario del Energia" });
    } else {
      res.status(200).send(energyStored);
    }
  });
}

async function updateEnergy(req, res) {
  const { id } = req.params;
  const energyData = req.body;

  Energy.findByIdAndUpdate({ _id: id }, energyData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario del energia" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteEnergy(req, res) {
  const { id } = req.params;

  Energy.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario del energia" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

async function existsEnergyFormBySiteAndPeriodAndYear(req, res) {
  const { period, year, site } = req.params;

  Energy.find(
    { period: period, year: year, site: site },
    {},
    (error, energies) => {
      if (error) {
        res
          .status(400)
          .send({ msg: "Error al obtener los formularios de energia" });
      } else {
        if (energies && energies.length > 0) {
          res.status(200).send({ code: 200, exist: true });
        } else {
          res.status(200).send({ code: 200, exist: false });
        }
      }
    }
  );
}

async function getPeriodEnergyFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Energy.find(
    { year: year, site: site },
    { _id: 0, period: 1 },
    (error, periods) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de energia de acuerdo al año",
          });
      } else {
        const newData = periods.map((item) => item.period);
        res.status(200).send({ code: 200, periods: newData });
      }
    }
  );
}

async function getEnergyFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  Energy.find(
    {
      $and: [
        { year: { $exists: true, $eq: year } },
        { site: { $exists: true, $eq: site } },
      ],
    },
    {},
    (error, energyForms) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de energia de acuerdo al año",
          });
      } else {
        res.status(200).send({ code: 200, energyForms: energyForms });
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
  getEnergy,
  getEnergies,
  createEnergy,
  updateEnergy,
  deleteEnergy,
  existsEnergyFormBySiteAndPeriodAndYear,
  getPeriodEnergyFormsBySiteAndYear,
  getEnergyFormsBySiteAndYear,
  uploadFile,
  getFile,
  deleteFile
};
