const bcrypt = require("bcryptjs");
const Role = require("../models/role");

async function getRole(req, res) {
  const { role_id } = req.user;

  const response = await Role.findById(role_id);
  // console.log(response)
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el rol" });
  } else {
    res.status(200).send(response);
  }
}

async function getRoles(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await Role.find();
  } else {
    response = await Role.find({ active });
  }

  res.status(200).send(response);
}

async function createRole(req, res) {
  //console.log(req.body);
  const role = new Role({ ...req.body, active: active });

  role.save((error, roleStored) => {
    if (error) {
      console.log(error)
      res.status(400).send({ msg: "Error al crear el rol" });
    } else {
      res.status(201).send(roleStored);
    }
  });
}

async function updateRole(req, res) {
  const { id } = req.params;
  const roleData = req.body;

  Role.findByIdAndUpdate({ _id: id }, roleData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el rol" });
    } else {
      // console.log(response)
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteRole(req, res) {
  const { id } = req.params;

  Role.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el rol" });
    } else {
      res.status(200).send({ msg: "Rol eliminado" });
    }
  });
}

module.exports = {
  getRole,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};