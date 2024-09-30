const bcrypt = require("bcryptjs");
const KPIs = require("../models/kpis");

async function getKPIs(req, res) {
  const { id } = req.params;
        
  const response = await KPIs.findById(id);
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el formulario de KPIs" });
  } else {
    res.status(200).send(response);
    
  }

}

async function getKPIsForms(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await KPIs.find();
  } else {
    response = await KPIs.find({ active });
  }

  res.status(200).send(response);
}

async function createKPIs(req, res) {
  const kpis = new KPIs({ ...req.body, active: true });

  kpis.save((error, kpisStored) => {
    if (error) {
      res.status(400).send({ msg: "Error al crear el formulario de KPIs" });
    } else {
      res.status(200).send(kpisStored);
    }
  });
}

async function updateKPIs(req, res) {
  const { id } = req.params;
  const kpisData = req.body;

  KPIs.findByIdAndUpdate({ _id: id }, kpisData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el formulario de KPIs" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteKPIs(req, res) {
  const { id } = req.params;

  KPIs.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el formulario de KPIs" });
    } else {
      res.status(200).send({ msg: "Formulario eliminado" });
    }
  });
}

async function existsKPIsFormBySiteAndPeriodAndYear(req, res) {
  const { period, year, site } = req.params;

  KPIs.find(
    { period: period, year: year, site: site },
    {},
    (error, energies) => {
      if (error) {
        res
          .status(400)
          .send({ msg: "Error al obtener los formularios de KPIs" });
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

async function getPeriodKPIsFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  KPIs.find(
    { year: year, site: site },
    { _id: 0, period: 1 },
    (error, periods) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de KPIs de acuerdo al año",
          });
      } else {
        const newData = periods.map((item) => item.period);
        res.status(200).send({ code: 200, periods: newData });
      }
    }
  );
}

async function getKPIsFormsBySiteAndYear(req, res) {
  const { year, site } = req.params;

  KPIs.find(
    {
      $and: [
        { year: { $exists: true, $eq: year } },
        { site: { $exists: true, $eq: site } },
      ],
    },
    {},
    (error, kpisForms) => {
      if (error) {
        res
          .status(400)
          .send({
            msg: "Error al obtener los formularios de KPIs de acuerdo al año",
          });
      } else {
        res.status(200).send({ code: 200, kpisForms: kpisForms });
      }
    }
  );
}

module.exports = {
  getKPIs,
  getKPIsForms,
  createKPIs,
  updateKPIs,
  deleteKPIs,
  existsKPIsFormBySiteAndPeriodAndYear,
  getPeriodKPIsFormsBySiteAndYear,
  getKPIsFormsBySiteAndYear
};
