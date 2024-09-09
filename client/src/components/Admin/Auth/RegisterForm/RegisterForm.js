import React, { useState } from "react";
import { Form, Message, Grid, GridColumn, Segment, Divider } from "semantic-ui-react";
import { useFormik } from "formik";
import { Auth } from "../../../../api";
import { initialValues, validationSchema } from "./RegisterForm.form";
import { Presentation } from "../Presentation";
import "./RegisterForm.scss";

const authController = new Auth();

export function RegisterForm(props) {
  const { openLogin } = props;
  const [error, setError] = useState("");
  const [viewMessage, setViewMessage] = useState(false);
  const [message, setMessage] = useState("");

  const formik = useFormik({
    initialValues: initialValues(),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        setError("");
        await authController.register(formValue).then((result) => {
          if (result.code && result.code === 200) {
            setMessage(
              "El usuario ha sido creado correctamente en espera de ser habilitado por el administrador"
            );
            setViewMessage(true);
            formik.resetForm();
          }
        });
        //openLogin();
      } catch (error) {
        // console.log(error);
        setError(error.msg);
      }
    },
  });

  return (
    <Segment placeholder style={{ width:"100%", background:"white"}} >
    <Grid centered columns={2}>
      <GridColumn floated="left" textAlign="center">
        <Presentation />
      </GridColumn>

      <GridColumn floated="rigth">
        <Form className="register-form" onSubmit={formik.handleSubmit}>
          {viewMessage ? (
            <Message info header="Información Importante" content={message} />
          ) : null}
          <Form.Input
            name="email"
            placeholder="Correo electronico"
            icon='user' 
            iconPosition='left' 
            size='large'
            label="Nombre de Usuario"
            onChange={formik.handleChange}
            value={formik.values.email}
            error={formik.errors.email}
          />
          <Form.Input
            name="password"
            type="password"
            icon='lock' 
            iconPosition='left' 
            placeholder="Contraseña"
            label="Contraseña"
            size='large'
            onChange={formik.handleChange}
            value={formik.values.password}
            error={formik.errors.password}
          />
          <Form.Input
            name="repeatPassword"
            type="password"
            icon='lock' 
            iconPosition='left' 
            size='large'
            placeholder="Repetir contraseña"
            label="Repetir Contraseña"
            onChange={formik.handleChange}
            value={formik.values.repeatPassword}
            error={formik.errors.repeatPassword}
          />
          <Form.Checkbox
            name="conditionsAccepted"
            label="He leído y acepto las poíticas de privacidad"
            onChange={(_, data) =>
              formik.setFieldValue("conditionsAccepted", data.checked)
            }
            checked={formik.values.conditionsAccepted}
            error={formik.errors.conditionsAccepted}
          />

          <Form.Button
            type="submit"
            primary
            fluid
            loading={formik.isSubmitting}
          >
            Crear cuenta
          </Form.Button>

          <p className="register-form__error">{error}</p>
        </Form>
      </GridColumn>
    </Grid>
    <Divider vertical></Divider>
    </Segment>
  );
}
