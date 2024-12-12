import React, { useCallback, useState, useEffect } from "react";
import {
  Form,
  Image,
  Grid,
  Table,
  Icon,
  Button,
  Comment,
  CommentGroup,
  CommentMetadata,
  Segment,
  Divider,
  Header,
  GridColumn,
  GridRow,
  Modal,
  ModalActions,
  ModalContent,
  ModalHeader
} from "semantic-ui-react";
import { useFormik, Field, FieldArray, FormikProvider, getIn } from "formik";
import { Waterform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV, PERIODS } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./WaterForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import { convertPeriodsEngToEsp, convertWaterFieldsEngToEsp } from "../../../../utils/converts";
import "./WaterForm.scss";

const waterFormController = new Waterform();

export function WaterForm(props) {
  const { onClose, onReload, waterForm, siteSelected , year, period } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [listPeriods, setListPeriods] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();

  const location = useLocation();
  //const { siteSelected } = location.state || {};

  if (!siteSelected) {
    // // Manejo de caso donde no hay datos en state (por ejemplo, acceso directo a la URL)
    // return <div>No se encontraron detalles de producto.</div>;
  }

  const navigate = useNavigate();

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateWater = (data, name) => {
    setFieldName(name);
    setTitleModal(`Comentarios ${data}`);
    onOpenCloseModal();
  };

  const formik = useFormik({
    initialValues: initialValues(waterForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!waterForm) {
          formValue.creator_user = user._id;
          formValue.date = new Date();
          if (user?.site) {
            formValue.site = user.site._id;
          } else {
            if (siteSelected) {
              formValue.site = siteSelected;
            }
            // } else {
            //   // Desencriptar los datos recibidos
            //   // if (!waterForm) {
            //   //   const siteData = decrypt(siteSelected);
            //   //   formValue.site = siteData;
            //   // }
            // }
          }
          await waterFormController.createWaterForm(accessToken, formValue);
          //console.log(formValue);
        } else {
          await waterFormController.updateWaterForm(
            accessToken,
            waterForm._id,
            formValue
          );
        }
        onReload();
        if (onClose) {
          onClose();
        } else {
          // Después de guardar exitosamente, navegamos hacia atrás
          goBack();
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  const goBack = () => {
    navigate(`/admin/data/waterforms`, {
      state: { siteSelected: siteSelected },
    });
  };

    // Generar una lista de años (por ejemplo, del 2000 al 2024)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    
  useEffect(() => {
    (async () => {
      try {
        const response =
          await waterFormController.getPeriodsWaterFormsBySiteAndYear(
            accessToken,
            siteSelected,
            formik.values.year
          );
          const periods = PERIODS.map((item) => item);
          const availablePeriods = periods
            .filter((period) => !response.periods.includes(period))
            .map((period) => period);
  
          setListPeriods(availablePeriods);
          console.log(availablePeriods)
      } catch (error) {
        console.error(error);
        setListPeriods([]);
      }
    })();
  }, [formik.values.year]);

  return (
    <Form className="water-form" onSubmit={formik.handleSubmit}>
      {waterForm ? (
        <Segment>
          <Header as="h4"> Fecha: {formatDateView(formik.values.date)}</Header>
          <Header as="h4">
            Usuario creador:{" "}
            {formik.values.creator_user
              ? formik.values.creator_user.lastname
                ? formik.values.creator_user.lastname +
                  " " +
                  formik.values.creator_user.firstname
                : formik.values.creator_user.email
              : null}{" "}
          </Header>
        </Segment>
      ) : null}
       {!waterForm ? (
        <>
          <Grid columns={2} divided>
            <GridRow>
              <GridColumn>
                <Form.Dropdown
                  label="Año"
                  placeholder="Seleccione"
                  options={years.map((year) => {
                    return {
                      key: year,
                      text: year,
                      value: year,
                    };
                  })}
                  selection
                  onChange={(_, data) =>
                    formik.setFieldValue("year", data.value)
                  }
                  value={formik.values.year}
                  error={formik.errors.year}
                />
              </GridColumn>
              <GridColumn>
                <Form.Dropdown
                  label="Periodo"
                  placeholder="Seleccione"
                  options={listPeriods.map((period) => {
                    return {
                      key: period,
                      text: convertPeriodsEngToEsp(period),
                      value: period,
                    };
                  })}
                  selection
                  onChange={(_, data) =>
                    formik.setFieldValue("period", data.value)
                  }
                  value={formik.values.period}
                  error={formik.errors.period}
                />
              </GridColumn>
            </GridRow>
          </Grid>
        </>
      ) : null}
      <Table size="small" celled>
        <Table.Header>
          <Table.Row>
          <Table.HeaderCell width="1">Codigo</Table.HeaderCell>
            <Table.HeaderCell width="5">Concepto</Table.HeaderCell>
            <Table.HeaderCell width="3">Valor</Table.HeaderCell>
            <Table.HeaderCell width="2">Unidad</Table.HeaderCell>
            <Table.HeaderCell width="2">Estado</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.municipal_network_water.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("municipal_network_water")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                type="number"
                name="municipal_network_water.value"
                onChange={formik.handleChange}
                value={formik.values.municipal_network_water.value}
                error={formik.errors.municipal_network_water}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="m3"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("municipal_network_water.unit", data.value)
                }
                value={formik.values.municipal_network_water.unit}
                error={formik.errors.municipal_network_water}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("municipal_network_water.isApproved", data.value)
                }
                value={formik.values.municipal_network_water.isApproved}
                error={formik.errors.municipal_network_water}
              />
              {/* {formik.values.municipal_network_water.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(convertWaterFieldsEngToEsp("municipal_network_water"), "municipal_network_water");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"municipal_network_water"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.cost_of_water_from_the_municipal_network.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("cost_of_water_from_the_municipal_network")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                type="number"
                name="cost_of_water_from_the_municipal_network.value"
                onChange={formik.handleChange}
                value={formik.values.cost_of_water_from_the_municipal_network.value}
                error={formik.errors.cost_of_water_from_the_municipal_network}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"$ Arg",name:" $ Arg"}, {_id:"US$",name:"US$"},{_id:"R$",name:"R$"},{_id:"$ Mxn",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("cost_of_water_from_the_municipal_network.unit", data.value)
                }
                value={formik.values.cost_of_water_from_the_municipal_network.unit}
                error={formik.errors.cost_of_water_from_the_municipal_network}
              />           
                     
              </Table.Cell>

            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("cost_of_water_from_the_municipal_network.isApproved", data.value)
                }
                value={formik.values.cost_of_water_from_the_municipal_network.isApproved}
                error={formik.errors.cost_of_water_from_the_municipal_network}
              />
              {/* {formik.values.cost_of_water_from_the_municipal_network.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateWater(convertWaterFieldsEngToEsp("cost_of_water_from_the_municipal_network"), "cost_of_water_from_the_municipal_network");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"cost_of_water_from_the_municipal_network"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.rainwater_harvesting.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("rainwater_harvesting")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="rainwater_harvesting.value"
                onChange={formik.handleChange}
                value={formik.values.rainwater_harvesting.value}
                error={formik.errors.rainwater_harvesting}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="m3"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("rainwater_harvesting.unit", data.value)
                }
                value={formik.values.rainwater_harvesting.unit}
                error={formik.errors.rainwater_harvesting}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("rainwater_harvesting.isApproved", data.value)
                }
                value={formik.values.rainwater_harvesting.isApproved}
                error={formik.errors.rainwater_harvesting}
              />
              {/* {formik.values.rainwater_harvesting.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(convertWaterFieldsEngToEsp("rainwater_harvesting"), "rainwater_harvesting");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"rainwater_harvesting"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.groundwater.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("groundwater")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="groundwater.value"
                onChange={formik.handleChange}
                value={formik.values.groundwater.value}
                error={formik.errors.groundwater}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="m3"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("groundwater.unit", data.value)
                }
                value={formik.values.groundwater.unit}
                error={formik.errors.groundwater}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
                 <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("groundwater.isApproved", data.value)
                }
                value={formik.values.groundwater.isApproved}
                error={formik.errors.groundwater}
              />
              {/* {formik.values.groundwater.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(convertWaterFieldsEngToEsp("groundwater"), "groundwater");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"groundwater"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.surface_water.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("surface_water")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="surface_water.value"
                onChange={formik.handleChange}
                value={formik.values.surface_water.value}
                error={formik.errors.surface_water}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="m3"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("surface_water.unit", data.value)
                }
                value={formik.values.surface_water.unit}
                error={formik.errors.surface_water}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
                     <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("surface_water.isApproved", data.value)
                }
                value={formik.values.surface_water.isApproved}
                error={formik.errors.surface_water}
              />
              {/* {formik.values.surface_water.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(convertWaterFieldsEngToEsp("surface_water"), "surface_water");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"surface_water"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.percentage_network_water.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("percentage_network_water")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_network_water.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_network_water.value}
                error={formik.errors.percentage_network_water}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="%"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("percentage_network_water.unit", data.value)
                }
                value={formik.values.percentage_network_water.unit}
                error={formik.errors.percentage_network_water}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("percentage-network_water.isApproved", data.value)
                }
                value={formik.values.percentage_network_water.isApproved}
                error={formik.errors.percentage_network_water}
              />
              {/* {formik.values.network_water.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(convertWaterFieldsEngToEsp("percentage_network_water"), "percentage_network_water");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"percentage_network_water"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.percentage_surface_water.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("percentage_surface_water")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_surface_water.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_surface_water.value}
                error={formik.errors.percentage_surface_water}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="%"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("percentage_surface_water.unit", data.value)
                }
                value={formik.values.percentage_surface_water.unit}
                error={formik.errors.percentage_surface_water}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
                           <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("percentage_surface_water.isApproved", data.value)
                }
                value={formik.values.percentage_surface_water.isApproved}
                error={formik.errors.percentage_surface_water}
              />
              {/* {formik.values.percentage_surface_water.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(
                    convertWaterFieldsEngToEsp("percentage_surface_water"),
                    "percentage_surface_water"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"percentage_surface_water"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.percentage_groundwater.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("percentage_groundwater")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="percentage_groundwater.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_groundwater.value}
                error={formik.errors.percentage_groundwater}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="%"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("percentage_groundwater.unit", data.value)
                }
                value={formik.values.percentage_groundwater.unit}
                error={formik.errors.percentage_groundwater}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            
            <Table.Cell>
          <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("percentage_groundwater.isApproved", data.value)
                }
                value={formik.values.percentage_groundwater.isApproved}
                error={formik.errors.percentage_groundwater}
              />
              {/* {formik.values.groundwater.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(
                    convertWaterFieldsEngToEsp("percentage_groundwater"),
                    "percentage_groundwater"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"percentage_groundwater"}/>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.total_water_consumed_per_unit_produced.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertWaterFieldsEngToEsp("total_water_consumed_per_unit_produced")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="total_water_consumed_per_unit_produced.value"
                onChange={formik.handleChange}
                value={formik.values.total_water_consumed_per_unit_produced.value}
                error={formik.errors.total_water_consumed_per_unit_produced}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="M3/un"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_water_consumed_per_unit_produced.unit", data.value)
                }
                value={formik.values.total_water_consumed_per_unit_produced.unit}
                error={formik.errors.total_water_consumed_per_unit_produced}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
          <Form.Dropdown
                placeholder="Seleccione"
                options={[{key:1, value:true,name:"Aprobado"}, {key:2 , value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_water_consumed_per_unit_produced.isApproved", data.value)
                }
                value={formik.values.total_water_consumed_per_unit_produced.isApproved}
                error={formik.errors.total_water_consumed_per_unit_produced}
              />
              {/* {formik.values.total_water_consumed_per_unit_produced.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateWater(
                    convertWaterFieldsEngToEsp("total_water_consumed_per_unit_produced"),
                    "total_water_consumed_per_unit_produced"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"total_water_consumed_per_unit_produced"}/>
            </Table.Cell>
          </Table.Row>

          
        </Table.Body>


      </Table>

      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <Comments
          formik={formik}
          fieldName={fieldName}
          onClose={onOpenCloseModal}
          onReload={onReload}
          waterForm={waterForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!waterForm ? "Guardar" : "Actualizar datos"}
        </Form.Button>
        <Form.Button
          type="button"
          color="red"
          secondary
          fluid
          onClick={() => {
            onClose ? onClose() : goBack();
          }}
        >
          {"Cancelar"}
        </Form.Button>
      </Form.Group>
    </Form>
  );
}

function Comments(props) {
  const { formik, user, fieldName, onClose } = props;
  const [comment, setComment] = useState("");

  const onChangeHandle = () => {
    if (comment && comment.length > 0) {
      let data = formik.values[fieldName].reviews;
      data.push({
        comment: comment,
        date: new Date(),
        reviewer_user: user ? user._id : null,
      });
      formik.setFieldValue(`${fieldName}.reviews`, data);
    }
    onClose();
  };

  const handleSaveComment = (id, editedContent) => {
    let data = formik.values[fieldName].reviews;
    data[id].comment = editedContent;
    data[id].date = new Date();
    formik.setFieldValue(`${fieldName}.reviews`, data);
  };

  return (
    <>
      <CommentGroup minimal>
        {formik.values[fieldName].reviews &&
        formik.values[fieldName].reviews.length > 0
          ? formik.values[fieldName].reviews.map((review, index) => (
              <>
                <EditableComment
                  id={index}
                  author={
                    review.reviewer_user
                      ? review.reviewer_user === user._id
                        ? user.firstname + " " + user.lastname
                        : review.reviewer_user.firstname +
                          " " +
                          review.reviewer_user.lastname
                      : ""
                  }
                  date={formatDateHourCompleted(review.date)}
                  content={review.comment}
                  onSave={handleSaveComment}
                  active={
                    review.reviewer_user
                      ? review.reviewer_user === user._id
                        ? true
                        : false
                      : false
                  }
                />
                <Divider fitted />
              </>
            ))
          : null}
        <Form.TextArea
          //  name={[fieldName].reviews.comments}
          placeholder=""
          rows={3}
          style={{ minHeight: 100, width: "100%" }}
          // onChange={formik.handleChange}
          onChange={(_, data) => setComment(data.value)}
          value={formik.values[fieldName].reviews.comments}
          error={formik.errors[fieldName]}
        />
        <Form.Button
          type="button"
          icon="edit"
          content={"Añadir comentario"}
          primary
          fluid
          onClick={onChangeHandle}
        ></Form.Button>
      </CommentGroup>
    </>
  );
}

const EditableComment = ({ id, author, date, content, onSave, active }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(id, editedContent); // Save edited content
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset edited content and toggle editing off
    setEditedContent(content);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditedContent(e.target.value);
  };

  return (
    <Comment>
      <Comment.Content>
        <Comment.Author>{author}</Comment.Author>
        <CommentMetadata>
          <div>{date}</div>
        </CommentMetadata>
        <Comment.Text>
          {isEditing ? (
            <Form reply>
              <Form.TextArea value={editedContent} onChange={handleChange} />
              <Button content="Guardar" onClick={handleSave} primary />
              <Button content="Cancelar" onClick={handleCancel} secondary />
            </Form>
          ) : (
            <div>{editedContent}</div>
          )}
        </Comment.Text>
        {active ? (
          <Comment.Actions>
            <Comment.Action onClick={handleEdit}>Editar</Comment.Action>
          </Comment.Actions>
        ) : null}
      </Comment.Content>
    </Comment>
  );
};

function FileUpload (props) {
  const {accessToken, data, field}=props;
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [message, setMessage] = useState('');

  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf',  
    //'application/vnd.ms-excel', // .xls
    //'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];

  useEffect(() => {
    if (data.values[field] && data.values[field].file!==null) {
     setFileName(data.values[field].file);
    }
  }, [field]);

   const handleFileChange = async (event) => {
    const file = event.target.files[0];
    
    if (file) {
      if (!allowedTypes.includes(file.type)) {
        console.log('Tipo de archivo no permitido. Debe ser JPG, PNG o PDF.');
      } else {
      setMessage(`Archivo seleccionado: ${file.name}`);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await waterFormController.uploadFileApi(accessToken,formData);
        setMessage(response.msg);
        if(response.status && response.status===200){
          setFile(file);
          setFileName(file.name);
          data.setFieldValue(`${field}.file`, file.name)
        }
      } catch (error) {
        setMessage('Error al subir el archivo');
      }
    }
    }
  };

  const handleButtonClick = (event) => {
    event.preventDefault(); // Evita que el formulario se envíe
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = handleFileChange;
    input.click();
  };

  const handleRemoveFile = async () => {
    setFile(null); // Elimina el archivo
    setFileName(null);
    try {
      const response = await waterFormController.deleteFileApi(accessToken,fileName);
      setMessage(response.message);
      removeFile();
    } catch (error) {
      setMessage('Error al elimianr el archivo');
    }
  };

  const removeFile = async () => {
    data.setFieldValue(`${field}.file`, null)
  };

  return (
    <>
     
      {fileName? (
        <>
          {/* <p>{file.name}</p> */}
          <FileViewer fileName={fileName} handleRemove={handleRemoveFile}/>
        </>
      ):  <Button icon onClick={handleButtonClick}>
                   <Icon name="paperclip" />
    </Button>}
    </>
  );

};

function FileViewer (props){
  const {fileName, handleRemove}=props;
  const [fileUrl, setFileUrl] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    if (fileName) {
      setFileUrl(fileName); // Construye la URL del archivo
      (async () => {
        try {
          const response = await waterFormController.getFileApi(fileName);
          setFileUrl(response); // Construye la URL del archivo
          //setMessage(response.message);
        } catch (error) {
          //setMessage('Error al elimianr el archivo');
        }
          })();
    
    }
  }, [fileName]);

  const handleOpenPreview = (event) => {
    event.preventDefault(); 
    setPreviewOpen(true);
  };

  const handleClosePreview = (event) => {
    event.preventDefault(); // Previene el comportamiento predeterminado
    setPreviewOpen(false);
  };

  return (
    <>
      {/* //<Button onClick={handleOpenPreview}> {fileName}</Button> */}
       
    <Modal
      onClose={ handleClosePreview}
      onOpen={handleOpenPreview}
      open={previewOpen}
      trigger={<Button primary icon><Icon name="file alternate"/></Button>}
    >
      <ModalHeader>{fileName}</ModalHeader>
      <ModalContent>
        {fileName && (fileName.endsWith('.jpg') || fileName.endsWith('.png') || fileName.endsWith('.jpeg'))  && (
            <Image src={fileUrl} alt="Vista previa" style={{ maxWidth: '100%' }} />
          )}
          {fileName && fileName.endsWith('.pdf') && (
            <iframe src={fileUrl} title="Vista previa" style={{ width: '100%', height: '500px' }} />
          )}
      </ModalContent>
      <ModalActions>
      <Button color="red" onClick={handleRemove}>
          <Icon disabled name='trash alternate' /> Eliminar
          </Button>
        <Button color='black' onClick={handleClosePreview}>
        <Icon disabled name='close' />Cerrar
        </Button>
      </ModalActions>
    </Modal>
    </>
  );
};