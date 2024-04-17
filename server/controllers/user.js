const bcrypt = require("bcryptjs");
const User = require("../models/user");
const image = require("../utils/image");

async function getUser(req, res) {
  const { user_id } = req.user;

  const response = await User.findById(user_id).populate("role");
  // console.log(response)
  if (!response) {
    res.status(400).send({ msg: "No se ha encontrado usuario" });
  } else {
    res.status(200).send(response);
  }
}

async function getUsers(req, res) {
  const { active } = req.query;
  let response = null;

  if (active === undefined) {
    response = await User.find();
  } else {
    response = await User.find({ active });
  }

  res.status(200).send(response);
}

async function createUser(req, res) {
  const { password } = req.body;
  //console.log(req.body);
  const user = new User({ ...req.body, active: false });

  const salt = bcrypt.genSaltSync(10);
  const hasPassword = bcrypt.hashSync(password, salt);
  user.password = hasPassword;

  if (req.files.avatar) {
    const imagePath = image.getFilePath(req.files.avatar);
    user.avatar = imagePath;
    user.avatar = "avatar/"+imagePath;
  }

  user.save((error, userStored) => {
    if (error) {
      res.status(500).send({ code:400, msg: "El usuario ya existe" });
    } else {
      if (!userStored) {
        res.status(400).send({ msg: "Error al crear el usuario" });
      } else {
        res.status(200).send(userStored);
      }
    }
  });
}

async function updateUser(req, res) {
  const { id } = req.params;
  const userData = req.body;

  if (userData.password) {
    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(userData.password, salt);
    userData.password = hashPassword;
  } else {
    delete userData.password;
  }

  if (req.files.avatar) {
    const imagePath = image.getFilePath(req.files.avatar);
    userData.avatar = "avatar/"+imagePath;
  }

  User.findByIdAndUpdate({ _id: id }, userData, (error,response) => {
    if (error) {
      res.status(400).send({ msg: "Error al actualizar el usuario" });
    } else {
      res.status(200).send({ msg: "Actualizacion correcta" });
    }
  });
}

async function deleteUser(req, res) {
  const { id } = req.params;

  User.findByIdAndDelete(id, (error) => {
    if (error) {
      res.status(400).send({ msg: "Error al eliminar el usuario" });
    } else {
      res.status(200).send({ msg: "Usuario eliminado" });
    }
  });
}

module.exports = {
  getUser,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};