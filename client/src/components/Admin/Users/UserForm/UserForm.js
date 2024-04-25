import React, { useCallback, useState, useEffect } from "react";
import { Form, Image } from "semantic-ui-react";
import { useFormik } from "formik";
import { useDropzone } from "react-dropzone";
import { User, Role } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { image } from "../../../../assets";
import { ENV } from "../../../../utils";
import { isAdmin } from "../../../../utils/checkPermission";
import { initialValues, validationSchema } from "./UserForm.form";
import "./UserForm.scss";

const userController = new User();
const roleController = new Role();

export function UserForm(props) {
  const { close, onReload, user } = props;
  const {
    accessToken,
    user: { role },
  } = useAuth();
  const [listRoles, setListRoles] = useState([]);

  useEffect(() => {
    roleController.getRoles(accessToken, true).then((response) => {
      setListRoles(response);
    });
  }, []);

  const formik = useFormik({
    initialValues: initialValues(user),
    validationSchema: validationSchema(user),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!user) {
          const response = await userController.createUser(
            accessToken,
            formValue
          );
          if (response.code && response.code === 500) {
          }
        } else {
          await userController.updateUser(accessToken, user._id, formValue);
        }
        onReload(true);
        close();
      } catch (error) {
        // console.log(2)
        console.error(error);
      }
    },
  });

  console.log(formik)
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      formik.setFieldValue("avatar", URL.createObjectURL(file));
      formik.setFieldValue("fileAvatar", file);
    },
    [formik]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/jpeg": [".jpeg"], "image/png": [".png"] },
    onDrop,
  });

  const getAvatar = () => {
    if (formik.values.fileAvatar) {
      return formik.values.avatar;
    } else if (formik.values.avatar) {
      return `${ENV.BASE_PATH}/${formik.values.avatar}`;
    }
    return image.noAvatar;
  };

  return (
    <Form className="user-form" onSubmit={formik.handleSubmit}>
      {/* <div className="user-form__avatar" {...getRootProps()}>
        <input {...getInputProps()} />
        <Image avatar size="small" src={getAvatar()} />
      </div> */}

      <Form.Group widths="equal">
        <Form.Input
          label="Nombre"
          name="firstname"
          placeholder="Nombre"
          onChange={formik.handleChange}
          value={formik.values.firstname}
          error={formik.errors.firstname}
        />
        <Form.Input
          label="Apellidos"
          name="lastname"
          placeholder="Apellidos"
          onChange={formik.handleChange}
          value={formik.values.lastname}
          error={formik.errors.lastname}
        />
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Input
          label="Empresa"
          name="company"
          placeholder="Empresa"
          onChange={formik.handleChange}
          value={formik.values.company}
          error={formik.errors.company}
        />
      </Form.Group>
      <Form.Group widths="equal">
        <Form.Input
          label="Sector"
          name="sector"
          placeholder="Sector"
          onChange={formik.handleChange}
          value={formik.values.sector}
          error={formik.errors.sector}
        />
        <Form.Input
          label="Posicion"
          name="position"
          placeholder="Posicion"
          onChange={formik.handleChange}
          value={formik.values.position}
          error={formik.errors.position}
        />
      </Form.Group>

      <Form.Group widths="equal">
        <Form.Input
          label="Correo Electronico"
          name="email"
          placeholder="Correo electronico"
          onChange={formik.handleChange}
          value={formik.values.email}
          error={formik.errors.email}
        />
        {isAdmin(role) ? (
          <Form.Dropdown
            label="Rol"
            placeholder="Seleccióna un rol"
            options={listRoles.map((ds) => {
              return {
                key: ds._id,
                text: ds.name,
                value: ds._id,
              };
            })}
            selection
            onChange={(_, data) => formik.setFieldValue("role", data.value)}
            value={formik.values.role}
            error={formik.errors.role}
          />
        ) : null}
      </Form.Group>

      <Form.Input
        label="Contraseña"
        type="password"
        name="password"
        placeholder="Contraseña"
        onChange={formik.handleChange}
        value={formik.values.password}
        error={formik.errors.password}
      />

      <Form.Button type="submit" primary fluid loading={formik.isSubmitting}>
        {user ? "Actualizar datos" : "Crear usuario"}
      </Form.Button>
    </Form>
  );
}
