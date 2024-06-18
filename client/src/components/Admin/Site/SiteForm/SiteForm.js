import React, { useCallback, useState } from "react";
import { Form, Image, Grid, Table, Icon, Button,  } from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import { useFormik, Field, FieldArray } from "formik";
import { Site } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV } from "../../../../utils";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./SiteForm.form";
import "./SiteForm.scss";

const siteController = new Site();

export function SiteForm(props) {
  const { onClose, onReload, site } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateSite = (data, name) => {
    setFieldName(name);
    console.log(name)
    setTitleModal(`Comentarios ${data}`);
    onOpenCloseModal();
  };

  const formik = useFormik({
    initialValues: initialValues(site),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!site) {
          //await siteController.createSite(accessToken, formValue);
          console.log(formValue)
        } else {
          await siteController.updateSite(accessToken, site._id, formValue);
        }

        onReload();
        onClose();
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <Form className="site-form" onSubmit={formik.handleSubmit}>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Concepto</Table.HeaderCell>
            <Table.HeaderCell>Valor</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <label className="label">Tipo de instalacion</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                // options={listRoles.map((ds) => {
                //   return {
                //     key: ds._id,
                //     text: ds.name,
                //     value: ds._id,
                //   };
                // })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type", data.value)
                }
                value={formik.values.installation_type}
                error={formik.errors.installation_type}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  // openUpdateSite("tipo de instalacion","installation_type");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("tipo de instalacion", "installation_type");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <label className="label">Categoria de productos</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                // options={listRoles.map((ds) => {
                //   return {
                //     key: ds._id,
                //     text: ds.name,
                //     value: ds._id,
                //   };
                // })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("category_product", data.value)
                }
                value={formik.values.installation_type}
                error={formik.errors.installation_type}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <label className="label">Dias trabajados en el mes</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="days_month"
                onChange={formik.handleChange}
                value={formik.values.days_month}
                error={formik.errors.days_month}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Dias totales trabajados</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="days_total"
                disabled={true}
                placeholder="Precio del curso"
                onChange={formik.handleChange}
                value={formik.values.days_total}
                error={formik.errors.days_total}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Horas trabajadas en el mes</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="hours_month"
                onChange={formik.handleChange}
                value={formik.values.hours_month}
                error={formik.errors.hours_month}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Horas totales trabajadas</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="hours_total"
                disabled={true}
                onChange={formik.handleChange}
                value={formik.values.hours_total}
                error={formik.errors.hours_total}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadores temporales
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="temporary_workers"
                onChange={formik.handleChange}
                value={formik.values.temporary_workers}
                error={formik.errors.temporary_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadores de produccion permanentes
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="permanent_production_workers"
                onChange={formik.handleChange}
                value={formik.values.permanent_production_workers}
                error={formik.errors.permanent_production_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadores administrativos permanentes
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="permanent_administrative_workers"
                onChange={formik.handleChange}
                value={formik.values.permanent_administrative_workers}
                error={formik.errors.permanent_administrative_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadoras de produccion femeninas
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="female_production_workers"
                onChange={formik.handleChange}
                value={formik.values.female_production_workers}
                error={formik.errors.female_production_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadores de produccion masculinos
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="male_production_workers"
                onChange={formik.handleChange}
                value={formik.values.male_production_workers}
                error={formik.errors.male_production_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadoras administrativas femeninas
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="female_administrative_workers"
                onChange={formik.handleChange}
                value={formik.values.female_administrative_workers}
                error={formik.errors.female_administrative_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadores administrativos masculinos
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="male_administrative_workers"
                onChange={formik.handleChange}
                value={formik.values.male_administrative_workers}
                error={formik.errors.male_administrative_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadoras femeninas en posiciones de liderazgo
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="female_workers_leadership_positions"
                onChange={formik.handleChange}
                value={formik.values.female_workers_leadership_positions}
                error={formik.errors.female_workers_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad de trabajadores masculinos en posiciones de liderazgo
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="male_workers_leadership_positions"
                onChange={formik.handleChange}
                value={formik.values.male_workers_leadership_positions}
                error={formik.errors.male_workers_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Cantidad promedio de trabajadores totales
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="average_total_workers"
                onChange={formik.handleChange}
                value={formik.values.average_total_workers}
                error={formik.errors.average_total_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Promedio de trabajadoras femeninas
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="average_female_workers"
                onChange={formik.handleChange}
                value={formik.values.average_female_workers}
                error={formik.errors.average_female_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Promedio de trabajadores masculinos
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="average_male_workers"
                onChange={formik.handleChange}
                value={formik.values.average_male_workers}
                error={formik.errors.average_male_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">% de trabajadoras femeninas</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_female_workers"
                onChange={formik.handleChange}
                value={formik.values.percentage_female_workers}
                error={formik.errors.percentage_female_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">% de trabajadores masculinos</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_female_workers"
                onChange={formik.handleChange}
                value={formik.values.percentage_male_workers}
                error={formik.errors.percentage_female_workers}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">% de mujeres totales</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_total_female"
                onChange={formik.handleChange}
                value={formik.values.percentage_total_female}
                error={formik.errors.percentage_total_female}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">% de hombres totales</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_total_male"
                onChange={formik.handleChange}
                value={formik.values.percentage_total_male}
                error={formik.errors.percentage_total_male}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                % de femeninas en posicion de liderazgo
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_female_leadership_positions"
                onChange={formik.handleChange}
                value={formik.values.percentage_female_leadership_positions}
                error={formik.errors.percentage_female_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                % de masculinos en posicion de liderazgo
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="price"
                placeholder="Precio del curso"
                onChange={formik.handleChange}
                value={formik.values.percentage_male_leadership_positions}
                error={formik.errors.percentage_male_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Accidentes de trabajo con dias de baja (+ de uno)
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="work_accidents_with_sick_days"
                onChange={formik.handleChange}
                value={formik.values.work_accidents_with_sick_days}
                error={formik.errors.work_accidents_with_sick_days}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                Primeros auxilios sin dias de baja (continua trabajando)
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="first_aid_without_sick_days"
                onChange={formik.handleChange}
                value={formik.values.first_aid_without_sick_days}
                error={formik.errors.first_aid_without_sick_days}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      {/* <Grid className="grid">
        <Grid.Row> */}
      {/* <Form.Group inline>
        <label>Tipo de instalacion</label>
        <Form.Input
          type="number"
          name="price"
          placeholder="Precio del curso"
          onChange={formik.handleChange}
          value={formik.values.price}
          error={formik.errors.price}
        />
      </Form.Group> */}

      {/* <Grid.Column width={8}>
            <label className="label">Tipo de instalacion</label>
          </Grid.Column>
          <Grid.Column>
          <Form.Dropdown
              placeholder="Seleccione"
              // options={listRoles.map((ds) => {
              //   return {
              //     key: ds._id,
              //     text: ds.name,
              //     value: ds._id,
              //   };
              // })}
              selection
              onChange={(_, data) => formik.setFieldValue("product_category", data.value)}
              value={formik.values.product_category}
              error={formik.errors.product_category}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Categoria de productos</label>
          </Grid.Column>
          <Grid.Column>
            <Form.Dropdown
              placeholder="Seleccione"
              // options={listRoles.map((ds) => {
              //   return {
              //     key: ds._id,
              //     text: ds.name,
              //     value: ds._id,
              //   };
              // })}
              selection
              onChange={(_, data) => formik.setFieldValue("product_category", data.value)}
              value={formik.values.product_category}
              error={formik.errors.product_category}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Dias trabajados en el mes</label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form.Input
              type="number"
              name="days_month"
              onChange={formik.handleChange}
              value={formik.values.days_month}
              error={formik.errors.days_month}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Dias totales trabajados</label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form.Input
              type="number"
              name="days_total"
              disabled={true}
              placeholder="Precio del curso"
              onChange={formik.handleChange}
              value={formik.values.days_total}
              error={formik.errors.days_total}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Horas trabajadas en el mes</label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form.Input
              type="number"
              name="hours_month"
              onChange={formik.handleChange}
              value={formik.values.hours_month}
              error={formik.errors.hours_month}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Horas totales trabajadas</label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form.Input
              type="number"
              name="hours_total"
              disabled={true}
              onChange={formik.handleChange}
              value={formik.values.hours_total}
              error={formik.errors.hours_total}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Cantidad de trabajadores temporales</label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form.Input
              type="number"
              name="temporary_workers"
              onChange={formik.handleChange}
              value={formik.values.temporary_workers}
              error={formik.errors.temporary_workers}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
            <label className="label">Cantidad de trabajadores de produccion permanentes</label>
          </Grid.Column>
          <Grid.Column width={4}>
            <Form.Input
              type="number"
              name="permanent_production_workers"
              onChange={formik.handleChange}
              value={formik.values.permanent_production_workers}
              error={formik.errors.permanent_production_workers}
            />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Cantidad de trabajadores administrativos permanentes</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="permanent_administrative_workers"
            onChange={formik.handleChange}
            value={formik.values.permanent_administrative_workers}
            error={formik.errors.permanent_administrative_workers}
          />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Cantidad de trabajadoras de produccion femeninas</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="female_production_workers"
            onChange={formik.handleChange}
            value={formik.values.female_production_workers}
            error={formik.errors.female_production_workers}
          />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Cantidad de trabajadores de produccion masculinos</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="male_production_workers"
            onChange={formik.handleChange}
            value={formik.values.male_production_workers}
            error={formik.errors.male_production_workers}
          />
              </Grid.Column>
        </Grid.Row>

        
        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Cantidad de trabajadoras administrativas femeninas</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="female_administrative_workers"
            onChange={formik.handleChange}
            value={formik.values.female_administrative_workers}
            error={formik.errors.female_administrative_workers}
          />
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Cantidad de trabajadores administrativos masculinos</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="male_administrative_workers"
            onChange={formik.handleChange}
            value={formik.values.male_administrative_workers}
            error={formik.errors.male_administrative_workers}
          />
          </Grid.Column>
        </Grid.Row>


        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">
            Cantidad de trabajadoras femeninas en posiciones de liderazgo
          </label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="female_workers_leadership_positions"
            onChange={formik.handleChange}
            value={formik.values.female_workers_leadership_positions}
            error={formik.errors.female_workers_leadership_positions}
          />
             </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">
            Cantidad de trabajadores masculinos en posiciones de liderazgo
          </label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="male_workers_leadership_positions"
            onChange={formik.handleChange}
            value={formik.values.male_workers_leadership_positions}
            error={formik.errors.male_workers_leadership_positions}
          />
              </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Cantidad promedio de trabajadores totales</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="average_total_workers"
            onChange={formik.handleChange}
            value={formik.values.average_total_workers}
            error={formik.errors.average_total_workers}
          />
            </Grid.Column>
        </Grid.Row>


        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Promedio de trabajadoras femeninas</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="average_female_workers"
            onChange={formik.handleChange}
            value={formik.values.average_female_workers}
            error={formik.errors.average_female_workers}
          />
            </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Promedio de trabajadores masculinos</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="average_male_workers"
            onChange={formik.handleChange}
            value={formik.values.average_male_workers}
            error={formik.errors.average_male_workers}
          />
            </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">% de trabajadoras femeninas</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="percentage_female_workers"
            onChange={formik.handleChange}
            value={formik.values.percentage_female_workers}
            error={formik.errors.percentage_female_workers}
          />
            </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">% de trabajadores masculinos</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="percentage_female_workers"
            onChange={formik.handleChange}
            value={formik.values.percentage_male_workers}
            error={formik.errors.percentage_female_workers}
          />
            </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">% de mujeres totales</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="percentage_total_female"
            onChange={formik.handleChange}
            value={formik.values.percentage_total_female}
            error={formik.errors.percentage_total_female}
          />
            </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">% de hombres totales</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="percentage_total_male"
            onChange={formik.handleChange}
            value={formik.values.percentage_total_male}
            error={formik.errors.percentage_total_male}
          />
        </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">% de femeninas en posicion de liderazgo</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="percentage_female_leadership_positions"
            onChange={formik.handleChange}
            value={formik.values.percentage_female_leadership_positions}
            error={formik.errors.percentage_female_leadership_positions}
          />
        </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">% de masculinos en posicion de liderazgo</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="price"
            placeholder="Precio del curso"
            onChange={formik.handleChange}
            value={formik.values.percentage_male_leadership_positions}
            error={formik.errors.percentage_male_leadership_positions}
          />
        </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">Accidentes de trabajo con dias de baja (+ de uno)</label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="work_accidents_with_sick_days"
            onChange={formik.handleChange}
            value={formik.values.work_accidents_with_sick_days}
            error={formik.errors.work_accidents_with_sick_days}
          />
        </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={8}>
          <label className="label">
            Primeros auxilios sin dias de baja (continua trabajando)
          </label>
          </Grid.Column>
          <Grid.Column width={4}>
          <Form.Input
            type="number"
            name="first_aid_without_sick_days"
            onChange={formik.handleChange}
            value={formik.values.first_aid_without_sick_days}
            error={formik.errors.first_aid_without_sick_days}
          />
        </Grid.Column>
        </Grid.Row>

      </Grid> */}

      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <Comments
          formik={formik}
          fieldName={fieldName}
          onClose={onOpenCloseModal}
          onReload={onReload}
          site={site}
        />
      </BasicModal>

      {/* <Form.Button type="submit" primary fluid loading={formik.isSubmitting}>
        {!site ? "Guardar" : "Actualizar datos"}
      </Form.Button> */}
    </Form>
  );
}

function Comments(props) {
  const { formik, fieldName, onClose } = props;

  console.log(fieldName, formik.values[fieldName])
  return (
    <>
    <Form>
           <FieldArray
             name="reviews"
             render={arrayHelpers => (
               <div>
                 {formik.values[fieldName].reviews && formik.values[fieldName].reviews.length > 0 ? (
                   formik.values[fieldName].reviews.map((review, index) => (
                     <div key={index}>
                       <Field name={`reviews.${index}`} />
                       <button
                         type="button"
                         onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                       >
                         -
                       </button>
                       <button
                         type="button"
                         onClick={() => arrayHelpers.insert(index, '')} // insert an empty string at a position
                       >
                         +
                       </button>
                     </div>
                   ))
                 ) : (
                   <button type="button" onClick={() => arrayHelpers.push('')}>
                     {/* show this when user has removed all friends from the list */}
                     Add a friend
                   </button>
                 )}
                 <div>
                   <button type="submit">Submit</button>
                 </div>
               </div>
             )}
           />
         </Form>
      {/* <Form.TextArea
        name={[fieldName].reviews.comments}
        placeholder=""
        rows={3}
        style={{ minHeight: 100,  width: "100%" }}
        // onChange={formik.handleChange}
        onChange={(_, data) => formik.setFieldValue(fieldName.reviews.comments, data.value)}
        value={formik.values.comments}
        error={formik.errors.comments}
      />
      <Form.Button primary fluid onClick={onClose}>
        {"Guardar"}
      </Form.Button> */}
    </>
  );
}

// function ModalComments() {
//   const [open, setOpen] = React.useState(false)

//   return (
//     <Modal
//       basic
//       onClose={() => setOpen(false)}
//       onOpen={() => setOpen(true)}
//       open={open}
//       size='small'
//       trigger={<Button>Basic Modal</Button>}
//     >
//       <Header icon>
//         <Icon name='archive' />
//         Archive Old Messages
//       </Header>
//       <ModalContent>
//         <p>
//           Your inbox is getting full, would you like us to enable automatic
//           archiving of old messages?
//         </p>
//       </ModalContent>
//       <ModalActions>
//         <Button basic color='red' inverted onClick={() => setOpen(false)}>
//           <Icon name='remove' /> No
//         </Button>
//         <Button color='green' inverted onClick={() => setOpen(false)}>
//           <Icon name='checkmark' /> Yes
//         </Button>
//       </ModalActions>
//     </Modal>
//   )
// }
