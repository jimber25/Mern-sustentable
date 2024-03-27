const bcrypt = require("bcryptjs");
const Permission = require("../models/permission");

async function getPermission(req, res) {
  const { permission_id } = req.user;

  const response = await Permission.findById(permission_id);
  // console.log(response)
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado el permiso" });
  } else {
    res.status(200).send(response);
  }
}

async function getPermissions(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await Permission.find();
  } else {
    response = await Permission.find({ active });
  }

  res.status(200).send(response);
}

async function createPermission(req, res) {
  //console.log(req.body);
  const permission = new Permission({ ...req.body, active: active });

  permission.save((error, permissionStored) => {
    if (error) {
      console.log(error)
      res.status(400).send({ msg: "Error al crear el permiso" });
    } else {
      res.status(201).send(permissionStored);
    }
  });
}

async function updatePermission(req, res) {
  const { id } = req.params;
  const permissionData = req.body;

  Permission.findByIdAndUpdate({ _id: id }, permissionData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el permiso" });
    } else {
      // console.log(response)
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deletePermission(req, res) {
  const { id } = req.params;

  Permission.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el permiso" });
    } else {
      res.status(200).send({ msg: "Permiso eliminado" });
    }
  });
}

module.exports = {
  getPermission,
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
};