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
  GridColumn,
  GridRow,
  Segment,
  Divider,
  Header,
  Label,
  TableRow
} from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import { useFormik, Field, FieldArray, FormikProvider, getIn } from "formik";
import { Energyform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV, PERIODS } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./EnergyForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import "./SiteForm.scss";
import { convertEnergyFieldsEngToEsp, convertPeriodsEngToEsp } from "../../../../utils/converts";

const energyFormController = new Energyform();

export function EnergyForm(props) {
  const { onClose, onReload, energyForm, site, siteSelected , year, period } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [listPeriods, setListPeriods] = useState([]);
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
    initialValues: initialValues(energyForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!energyForm) {
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
            //   if (!energyForm) {
            //     const siteData = decrypt(siteSelected);
            //     formValue.site = siteData;
            //   }
            // }
          }
          await energyFormController.createEnergyForm(accessToken, formValue);
          //console.log(formValue);
        } else {
          await energyFormController.updateEnergyForm(
            accessToken,
            energyForm._id,
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
    navigate(`/admin/data/energyforms`, {
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
          await energyFormController.getPeriodsEnergyFormsBySiteAndYear(
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
    <Form className="energy-form" onSubmit={formik.handleSubmit}>
      {energyForm ? (
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
      {!energyForm ? (
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
            <Table.HeaderCell width="5">Concepto</Table.HeaderCell>
            <Table.HeaderCell width="2">Valor</Table.HeaderCell>
            <Table.HeaderCell width="1">Unidad</Table.HeaderCell>
            <Table.HeaderCell width="2">Estado</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {/* Electricidad */}
        <Table.Row>
            <Table.Cell>
            <Label ribbon>Electricidad</Label>
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
              <label className="label">
                {formik.values.electricity.electricity_standard.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("electricity_standard")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electricity.electricity_standard.value"
                value={formik.values.electricity.electricity_standard.value}
                error={formik.errors.electricity}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="MHW"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("electricity.electricity_standard.isApproved", data.value)
                }
                value={formik.values.electricity.electricity_standard.isApproved}
                error={formik.errors.electricity}
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
                  formik.setFieldValue(`electricity.electricity_standard.isApproved`, data.value)
                }
                value={formik.values.electricity.electricity_standard.isApproved}
                error={formik.errors.electricity}
              />
              {/* {formik.values.electricity.electricity_standard.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Electricidad standard en MHW", `electricity.electricity_standard}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Electricidad standard en MHW", "electricity.electricity_standard");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.electricity.electricity_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("electricity_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electricity.electricity_cost.value"
                value={formik.values.electricity.electricity_cost.value}
                error={formik.errors.electricity}
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
                  formik.setFieldValue("electricity.electricity_cost", data.value)
                }
                value={formik.values.electricity.electricity_cost.value}
                error={formik.errors.electricity}
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
                  formik.setFieldValue(`electricity.electricity_cost.isApproved`, data.value)
                }
                value={formik.values.electricity.electricity_cost.isApproved}
                error={formik.errors.electricity}
              />
              {/* {formik.values.electricity.electricity_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo electricidad ", `electricity.electricity_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo electricidad ", "electricity.electricity_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
          
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.electricity.renewable_energies.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("renewable_energies")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electricity.renewable_energies.value"
                value={formik.values.electricity.renewable_energies.value}
                error={formik.errors.electricity}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="MHW"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("electricity.renewable_energies.isApproved", data.value)
                }
                value={formik.values.electricity.renewable_energies.isApproved}
                error={formik.errors.electricity}
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
                  formik.setFieldValue(`electricity.renewable_energies.isApproved`, data.value)
                }
                value={formik.values.electricity.renewable_energies.isApproved}
                error={formik.errors.electricity}
              />
              {/* {formik.values.electricity.renewable_energies.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Energías Renovables (PPA o compra) en MHW", `electricity.renewable_energies}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Energías Renovables (PPA o compra) en MHW", "electricity.renewable_energies");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
      
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.electricity.renewable_energies_produced_and_consumed_on_site.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("renewable_energies_produced_and_consumed_on_site")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electricity.renewable_energies_produced_and_consumed_on_site.value"
                value={formik.values.electricity.renewable_energies_produced_and_consumed_on_site.value}
                error={formik.errors.electricity}/>
            </Table.Cell>

            <Table.Cell>
            <Form.Dropdown
                placeholder="MHW"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("electricity.renewable_energies_produced_and_consumed_on_site.isApproved", data.value)
                }
                value={formik.values.electricity.renewable_energies_produced_and_consumed_on_site.isApproved}
                error={formik.errors.electricity}
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
                  formik.setFieldValue(`electricity.renewable_energies_produced_and_consumed_on_site.isApproved`, data.value)
                }
                value={formik.values.electricity.renewable_energies_produced_and_consumed_on_site.isApproved}
                error={formik.errors.electricity}
              />
              {/* {formik.values.electricity.renewable_energies_produced_and_consumed_on_site.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Energías renovables producidas y consumidas en el sitio en MHW", `electricity.renewable_energies_produced_and_consumed_on_site}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Energías renovables producidas y consumidas en el sitio en MHW", "electricity.renewable_energies_produced_and_consumed_on_site");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

{/* Combustibles */}
<Table.Row>
            <Table.Cell>
            <Label ribbon>Combustibles</Label>
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
              <label className="label">
                {formik.values.fuels.steam.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("steam")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.steam.value"
                value={formik.values.fuels.steam.value}
                error={formik.errors.fuels}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="KJ"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.steam.isApproved", data.value)
                }
                value={formik.values.fuels.steam.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.steam.isApproved`, data.value)
                }
                value={formik.values.fuels.steam.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.steam.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Vapor", `fuels.steam}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Vapor", "fuels.steam");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.steam_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("steam_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.steam_cost.value"
                value={formik.values.fuels.steam_cost.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue("fuels.steam_cost", data.value)
                }
                value={formik.values.fuels.steam_cost.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.steam_cost.isApproved`, data.value)
                }
                value={formik.values.fuels.steam_cost.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.steam_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del vapor", `fuels.steam_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del vapor ", "fuels.steam_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
          
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.natural_gas.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("natural_gas")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electricity.natural_gas.value"
                value={formik.values.fuels.natural_gas.value}
                error={formik.errors.fuels}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.natural_gas.isApproved", data.value)
                }
                value={formik.values.fuels.natural_gas.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.natural_gas.isApproved`, data.value)
                }
                value={formik.values.fuels.natural_gas.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.natural_gas.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Gas Natural", `fuels.natural_gas}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Gas Natural", "fuels.natural_gas");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
      
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.natural_gas_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("natural_gas_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.natural_gas_cost.value"
                value={formik.values.fuels.natural_gas_cost.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.natural_gas_cost", data.value)
                }
                value={formik.values.fuels.natural_gas_cost.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.natural_gas_cost.isApproved`, data.value)
                }
                value={formik.values.fuels.natural_gas_cost.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.natural_gas_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo Gas Natural", `fuels.natural_gas_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo Gas Natural", "fuels.natural_gas_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.glp.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("glp")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.glp.value"
                value={formik.values.fuels.glp.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.glp.isApproved", data.value)
                }
                value={formik.values.fuels.glp.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.glp.isApproved`, data.value)
                }
                value={formik.values.fuels.glp.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.glp.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("GLP (gas licuado de petróleo)", `fuels.glp}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("GLP (gas licuado de petróleo)", "fuels.glp");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.glp_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("glp_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.glp_cost.value"
                value={formik.values.fuels.glp_cost.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.glp_cost", data.value)
                }
                value={formik.values.fuels.glp_cost.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.glp_cost.isApproved`, data.value)
                }
                value={formik.values.fuels.glp_cost.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.electricity.glp_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del GLP", `fuels.glp_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del GLP", "fuels.glp_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.heavy_fuel_oil.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("heavy_fuel_oil")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.heavy_fuel_oil.value"
                value={formik.values.fuels.heavy_fuel_oil.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.heavy_fuel_oil.isApproved", data.value)
                }
                value={formik.values.fuels.heavy_fuel_oil.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.heavy_fuel_oil.isApproved`, data.value)
                }
                value={formik.values.fuels.heavy_fuel_oil.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.glp_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del GLP", `fuels.heavy_fuel_oil}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del GLP", "fuels.heavy_fuel_oil");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.cost_of_heavy_fuel_oil.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("cost_of_heavy_fuel_oil")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.cost_of_heavy_fuel_oil.value"
                value={formik.values.fuels.cost_of_heavy_fuel_oil.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.cost_of_heavy_fuel_oil", data.value)
                }
                value={formik.values.fuels.cost_of_heavy_fuel_oil.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.cost_of_heavy_fuel_oil.isApproved`, data.value)
                }
                value={formik.values.fuels.cost_of_heavy_fuel_oil.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.glp_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del Heavy fuel Oil (aceite combustible pesado)", `fuels.cost_of_heavy_fuel_oil}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del Heavy fuel Oil (aceite combustible pesado)", "fuels.cost_of_heavy_fuel_oil");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.light_fuel_oil.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("light_fuel_oil")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.light_fuel_oil.value"
                value={formik.values.fuels.light_fuel_oil.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.light_fuel_oil.isApproved", data.value)
                }
                value={formik.values.fuels.light_fuel_oil.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.light_fuel_oil.isApproved`, data.value)
                }
                value={formik.values.fuels.light_fuel_oil.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.glp_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del Heavy fuel Oil (aceite combustible pesado)", `fuels.light_fuel_oil}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del Heavy fuel Oil (aceite combustible pesado)", "fuels.light_fuel_oil");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.coal.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("coal")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.coal.value"
                value={formik.values.fuels.coal.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.coal.isApproved", data.value)
                }
                value={formik.values.fuels.coal.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.coal.isApproved`, data.value)
                }
                value={formik.values.fuels.coal.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.glp_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Carbón", `fuels.coal}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Carbón", "fuels.coal");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.coal_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("coal_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.coal_cost.value"
                value={formik.values.fuels.coal_cost.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.coal_cost", data.value)
                }
                value={formik.values.fuels.coal_cost.value}
                error={formik.errors.coal}
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
                  formik.setFieldValue(`fuels.coal_cost.isApproved`, data.value)
                }
                value={formik.values.fuels.coal_cost.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.coal_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del Carbón", `fuels.coal_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del Carbón", "fuels.coal_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
          
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.diesel.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("diesel")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.diesel.value"
                value={formik.values.fuels.diesel.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.diesel.isApproved", data.value)
                }
                value={formik.values.fuels.diesel.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.diesel.isApproved`, data.value)
                }
                value={formik.values.fuels.diesel.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.coal_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Diesel", `fuels.diesel}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Diesel", "fuels.diesel");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>
          
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.diesel_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("diesel_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.diesel_cost.value"
                value={formik.values.fuels.diesel_cost.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.diesel_cost", data.value)
                }
                value={formik.values.fuels.diesel_cost.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.diesel_cost.isApproved`, data.value)
                }
                value={formik.values.fuels.diesel_cost.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.diesel_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo del Diesel", `fuels.diesel_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo del Diesel", "fuels.diesel_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.gasoline_for_internal_vehicles.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("gasoline_for_internal_vehicles")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.gasoline_for_internal_vehicles.value"
                value={formik.values.fuels.gasoline_for_internal_vehicles.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.gasoline_for_internal_vehicles.isApproved", data.value)
                }
                value={formik.values.fuels.gasoline_for_internal_vehicles.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.gasoline_for_internal_vehicles.isApproved`, data.value)
                }
                value={formik.values.fuels.gasoline_for_internal_vehicles.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.gasoline_for_internal_vehicles.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Gasolina para los vehículos internos (autoelevadores)", `fuels.gasoline_for_internal_vehicles}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Gasolina para los vehículos internos (autoelevadores)", "fuels.gasoline_for_internal_vehicles");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.gasoline_cost_of_internal_vehicles.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("gasoline_cost_of_internal_vehicles")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.gasoline_cost_of_internal_vehicles.value"
                value={formik.values.fuels.gasoline_cost_of_internal_vehicles.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.gasoline_cost_of_internal_vehicles", data.value)
                }
                value={formik.values.fuels.gasoline_cost_of_internal_vehicles.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.gasoline_cost_of_internal_vehicles.isApproved`, data.value)
                }
                value={formik.values.fuels.gasoline_cost_of_internal_vehicles.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.gasoline_cost_of_internal_vehicles.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de Gasolina de los vehículos internos", `fuels.gasoline_cost_of_internal_vehicles}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo de Gasolina de los vehículos internos", "fuels.gasoline_cost_of_internal_vehicles");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.biomass.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("biomass")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.biomass.value"
                value={formik.values.fuels.biomass.value}
                error={formik.errors.fuels}/>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Dato fijo"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fuels.biomass.isApproved", data.value)
                }
                value={formik.values.fuels.biomass.isApproved}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.biomass.isApproved`, data.value)
                }
                value={formik.values.fuels.biomass.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.biomass.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Biomasa", `fuels.biomass}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Biomasa", "fuels.biomass");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
         
          </Table.Row>

          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.fuels.biomass_cost.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertEnergyFieldsEngToEsp("biomass_cost")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="fuels.biomass_cost.value"
                value={formik.values.fuels.biomass_cost.value}
                error={formik.errors.fuels}/>
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
                  formik.setFieldValue("fuels.biomass_cost", data.value)
                }
                value={formik.values.fuels.biomass_cost.value}
                error={formik.errors.fuels}
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
                  formik.setFieldValue(`fuels.biomass_cost.isApproved`, data.value)
                }
                value={formik.values.fuels.biomass_cost.isApproved}
                error={formik.errors.fuels}
              />
              {/* {formik.values.fuels.biomass_cost.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de Biomasa", `fuels.biomass_cost}`);
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Costo de Biomasa", "fuels.biomass_cost");
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
          energyForm={energyForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!energyForm ? "Guardar" : "Actualizar datos"}
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

