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
  GridColumn,
  CommentMetadata,
  GridRow,
  Label,
  TableFooter,
  TableHeaderCell,
  TableRow,
  Segment,
  Divider,
  Header,
} from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import { useFormik, Field, FieldArray, FormikProvider, getIn } from "formik";
import { KPIsform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./KPIsForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import { PERIODS } from "../../../../utils";
import { convertKPIsFieldsEngToEsp, convertPeriodsEngToEsp } from "../../../../utils/converts";
import "./KPIsForm.scss";

const kpisFormController = new KPIsform();

export function KPIsForm(props) {
  const { onClose, onReload, kpisForm, siteSelected , year, period} = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [listPeriods, setListPeriods] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();

  const location = useLocation();
  // const { siteSelected } = location.state || {};

  if (!siteSelected) {
    // // Manejo de caso donde no hay datos en state (por ejemplo, acceso directo a la URL)
    // return <div>No se encontraron detalles de producto.</div>;
  }

  const navigate = useNavigate();

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateSite = (data, name) => {
    setFieldName(name);
    setTitleModal(`Comentarios ${data}`);
    onOpenCloseModal();
  };

  const formik = useFormik({
    initialValues: initialValues(kpisForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!kpisForm) {
          formValue.creator_user = user._id;
          formValue.date = new Date();
          if (user?.site) {
            formValue.site = user.site._id;
          } else {
            if (siteSelected) {
              formValue.site = siteSelected;
            } 
            // else {
            //   // Desencriptar los datos recibidos
            //   if (!kpisForm) {
            //     //const siteData = decrypt(siteSelected);
            //     //formValue.site = siteData;
            //     formValue.site = siteSelected;
            //   }
            // }
          }
          await kpisFormController.createKPIsForm(
            accessToken,
            formValue
          );
          //console.log(formValue);
        } else {
          await kpisFormController.updateKPIsForm(
            accessToken,
            kpisForm._id,
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
    navigate(`/admin/data/kpisforms`, {
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
          await kpisFormController.getPeriodsKPIsFormsBySiteAndYear(
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
    <Form className="kpis-form" onSubmit={formik.handleSubmit}>
      {kpisForm ? (
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
      {!kpisForm ? (
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
            <Table.HeaderCell width="2">Codigo</Table.HeaderCell>
            <Table.HeaderCell width="6">Concepto</Table.HeaderCell>
            <Table.HeaderCell width="3">Valor</Table.HeaderCell>
            <Table.HeaderCell width="2">Estado</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {/* Electricidad */}
        <Table.Row>
            <Table.Cell>
            <Label ribbon>{convertKPIsFieldsEngToEsp("energy_indicators")}</Label>
            </Table.Cell>
            <Table.Cell>
            </Table.Cell>
            <Table.Cell>
            </Table.Cell>
            <Table.Cell>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_fuel_energy_consumption")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.total_fuel_energy_consumption.value"
                value={formik.values.energy_indicators.total_fuel_energy_consumption.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.total_fuel_energy_consumption.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.total_fuel_energy_consumption.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.total_fuel_energy_consumption.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_fuel_energy_consumption"), `energy_indicators.total_fuel_energy_consumption}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_fuel_energy_consumption"), "energy_indicators.total_fuel_energy_consumption");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_electrical_energy_consumption")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.total_electrical_energy_consumption.value"
                value={formik.values.energy_indicators.total_electrical_energy_consumption.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.total_electrical_energy_consumption.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.total_electrical_energy_consumption.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.total_electrical_energy_consumption.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_electrical_energy_consumption"), `energy_indicators.total_electrical_energy_consumption}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_electrical_energy_consumption"), "energy_indicators.total_electrical_energy_consumption");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_energy_consumption")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.total_energy_consumption.value"
                value={formik.values.energy_indicators.total_energy_consumption.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.total_energy_consumption.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.total_energy_consumption.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.total_energy_consumption.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_energy_consumption"), `energy_indicators.total_energy_consumption}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_energy_consumption"), "energy_indicators.total_energy_consumption");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_renewable_energy")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.total_renewable_energy.value"
                value={formik.values.energy_indicators.total_renewable_energy.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.total_renewable_energy.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.total_renewable_energy.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.total_renewable_energy.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_renewable_energy"), `energy_indicators.total_renewable_energy}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_renewable_energy"), "energy_indicators.total_renewable_energy");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("percentage_of_renewable_energy")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.percentage_of_renewable_energy.value"
                value={formik.values.energy_indicators.percentage_of_renewable_energy.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.percentage_of_renewable_energy.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.percentage_of_renewable_energy.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.percentage_of_renewable_energy.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("percentage_of_renewable_energy"), `energy_indicators.percentage_of_renewable_energy}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("percentage_of_renewable_energy"), "energy_indicators.percentage_of_renewable_energy");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("percentage_energy_from_fossil_fuels")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.percentage_energy_from_fossil_fuels.value"
                value={formik.values.energy_indicators.percentage_energy_from_fossil_fuels.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.percentage_energy_from_fossil_fuels.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.percentage_energy_from_fossil_fuels.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.percentage_energy_from_fossil_fuels.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("percentage_energy_from_fossil_fuels"), `energy_indicators.percentage_energy_from_fossil_fuels}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("percentage_energy_from_fossil_fuels"), "energy_indicators.percentage_energy_from_fossil_fuels");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_energy_consumed_per_productive_unit")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.total_energy_consumed_per_productive_unit.value"
                value={formik.values.energy_indicators.total_energy_consumed_per_productive_unit.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.total_energy_consumed_per_productive_unit.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.total_energy_consumed_per_productive_unit.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.total_energy_consumed_per_productive_unit.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_energy_consumed_per_productive_unit"), `energy_indicators.total_energy_consumed_per_productive_unit}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_energy_consumed_per_productive_unit"), "energy_indicators.total_energy_consumed_per_productive_unit");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          
          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_cost_of_energy_consumed")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="energy_indicators.total_cost_of_energy_consumed.value"
                value={formik.values.energy_indicators.total_cost_of_energy_consumed.value}
                error={formik.errors.energy_indicators}
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
                  formik.setFieldValue(`energy_indicators.total_cost_of_energy_consumed.isApproved`, data.value)
                }
                value={formik.values.energy_indicators.total_cost_of_energy_consumed.isApproved}
                error={formik.errors.energy_indicators}
              />
              {/* {formik.values.energy_indicators.total_cost_of_energy_consumed.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_cost_of_energy_consumed"), `energy_indicators.total_energy_consumed_per_productive_unit}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_cost_of_energy_consumed"), "energy_indicators.total_cost_of_energy_consumed");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
{/* INDICADOR DE GASES DE EFECTO INVERNADERO GEI */}
<Table.Row>
            <Table.Cell>
            <Label ribbon>{convertKPIsFieldsEngToEsp("greenhouse_gas_indicators")}</Label>
              {/* <label className="label">Combustibles</label> */}
            </Table.Cell>
            <Table.Cell>
            </Table.Cell>
            <Table.Cell>
            </Table.Cell>
            <Table.Cell>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_scope_1")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.total_scope_1.value"
                value={formik.values.greenhouse_gas_indicators.total_scope_1.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.total_scope_1.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.total_scope_1.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.total_scope_1.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_scope_1"), `greenhouse_gas_indicators.total_scope_1}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_scope_1"), "greenhouse_gas_indicators.total_scope_1");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_scope_2")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.total_scope_2.value"
                value={formik.values.greenhouse_gas_indicators.total_scope_2.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.total_scope_2.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.total_scope_2.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.total_scope_1.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_scope_2"), `greenhouse_gas_indicators.total_scope_2}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_scope_2"), "greenhouse_gas_indicators.total_scope_2");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_scope_3")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.total_scope_3.value"
                value={formik.values.greenhouse_gas_indicators.total_scope_3.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.total_scope_3.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.total_scope_3.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.total_scope_3.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_scope_3"), `greenhouse_gas_indicators.total_scope_3}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_scope_3"), "greenhouse_gas_indicators.total_scope_3");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_emissions_per_unit_produced")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.total_emissions_per_unit_produced.value"
                value={formik.values.greenhouse_gas_indicators.total_emissions_per_unit_produced.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.total_emissions_per_unit_produced.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.total_emissions_per_unit_produced.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.total_scope_3.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_emissions_per_unit_produced"), `greenhouse_gas_indicators.total_emissions_per_unit_produced}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_emissions_per_unit_produced"), "greenhouse_gas_indicators.total_emissions_per_unit_produced");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
          
          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("total_emissions")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.total_emissions.value"
                value={formik.values.greenhouse_gas_indicators.total_emissions.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.total_emissions.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.total_emissions.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.total_emissions.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("total_emissions"), `greenhouse_gas_indicators.total_emissions}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("total_emissions"), "greenhouse_gas_indicators.total_emissions");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("scope_percentage_1")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.scope_percentage_1.value"
                value={formik.values.greenhouse_gas_indicators.scope_percentage_1.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.scope_percentage_1.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.scope_percentage_1.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.scope_percentage_1.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("scope_percentage_1"), `greenhouse_gas_indicators.scope_percentage_1}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("scope_percentage_1"), "greenhouse_gas_indicators.scope_percentage_1");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("scope_percentage_2")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.scope_percentage_2.value"
                value={formik.values.greenhouse_gas_indicators.scope_percentage_2.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.scope_percentage_2.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.scope_percentage_2.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.scope_percentage_2.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("scope_percentage_2"), `greenhouse_gas_indicators.scope_percentage_2}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("scope_percentage_2"), "greenhouse_gas_indicators.scope_percentage_2");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">{convertKPIsFieldsEngToEsp("scope_percentage_3")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="greenhouse_gas_indicators.scope_percentage_3.value"
                value={formik.values.greenhouse_gas_indicators.scope_percentage_3.value}
                error={formik.errors.greenhouse_gas_indicators}
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
                  formik.setFieldValue(`greenhouse_gas_indicators.scope_percentage_3.isApproved`, data.value)
                }
                value={formik.values.greenhouse_gas_indicators.scope_percentage_3.isApproved}
                error={formik.errors.greenhouse_gas_indicators}
              />
              {/* {formik.values.greenhouse_gas_indicators.scope_percentage_2.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertKPIsFieldsEngToEsp("scope_percentage_3"), `greenhouse_gas_indicators.scope_percentage_3}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertKPIsFieldsEngToEsp("scope_percentage_3"), "greenhouse_gas_indicators.scope_percentage_3");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
        </Table.Body>

        {/* <TableFooter fullWidth>
      <TableRow>
        <TableHeaderCell />
        <TableHeaderCell colSpan='4'>
          <Button
            floated='right'
            labelPosition='left'
            secundary
            size='small'
          > Aprobar todos
          </Button>
        </TableHeaderCell>
      </TableRow>
    </TableFooter> */}
      </Table>

      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <Comments
          formik={formik}
          fieldName={fieldName}
          onClose={onOpenCloseModal}
          onReload={onReload}
          kpisForm={kpisForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!kpisForm ? "Guardar" : "Actualizar datos"}
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
  console.log(user);

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
