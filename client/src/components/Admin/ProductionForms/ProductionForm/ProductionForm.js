import React, { useCallback, useState } from "react";
import {
  Form,
  Image,
  Grid,
  Table,
  Icon,
  Button,
  Comment,
  CommentGroup,
  CommentContent,
  CommentMetadata,
  CommentText,
  CommentAuthor,
  TableFooter,
  TableHeaderCell,
  TableRow,
  Segment,
  Divider,
  Header,
} from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import { useFormik, Field, FieldArray, FormikProvider, getIn } from "formik";
import { Energyform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./EnergyForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import "./Energyform.scss";

const energyFormController = new Energyform();

export function EnergyForm(props) {
  const { onClose, onReload, energyForm,energy } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();

  const location = useLocation();
  const { energySelected } = location.state || {};

  if (!energySelected) {
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
    initialValues: initialValues(energyForm),
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
            if (energy) {
              formValue.site = energy;
            } else {
              // Desencriptar los datos recibidos
              if (!energyForm) {
                const energyData = decrypt(energySelected);
                formValue.energy = energyData;
              }
            }
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
      state: { siteSelected: energySelected },
    });
  };

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
      <Table size="small" celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell width="6">Concepto</Table.HeaderCell>
            <Table.HeaderCell width="3">Valor</Table.HeaderCell>
            <Table.HeaderCell width="2">Estado</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>


        <Table.Row>
            <Table.Cell>
              <label className="label">Electricidad standard en MHW</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="standard_electricity.value"
                onChange={formik.handleChange}
                value={formik.values.standard_electricity.value}
                error={formik.errors.standard_electricity}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("standard_electricity.isApproved", data.value)
                }
                value={formik.values.standard_electricity.isApproved}
                error={formik.errors.standard_electricity}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Electricidad standard en MHW", "standard_electricity");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de prodcuto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Costo de Electicidad</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "MHW" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("electricity_cost.value", data.value)
                }
                value={formik.values.electricity_cost.value}
                error={formik.errors.electricity_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}
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
                  formik.setFieldValue("electricity_cost.isApproved", data.value)
                }
                value={formik.values.electricity_cost.isApproved}
                error={formik.errors.electricity_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Conto de lectricidad ", "electricity_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("electricity_cost.value", data.value)
                }
                value={formik.values.electricity_cost.value}
                error={formik.errors.electricity_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("electricity_cost.isApproved", data.value)
                }
                value={formik.values.electricity_cost.isApproved}
                error={formik.errors.electricity_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo de electricidad", "electricity_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          

          <Table.Row>
            <Table.Cell>
              <label className="label">Energia Renovable</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="renewable_Energies.value"
                onChange={formik.handleChange}
                value={formik.values.renewable_Energies.value}
                error={formik.errors.renewable_Energies}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("renewable_Energies.isApproved", data.value)
                }
                value={formik.values.renewable_Energies.isApproved}
                error={formik.errors.renewable_Energies}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Energias renovables", "");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Energias renovables");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>


          
          <Table.Row>
            <Table.Cell>
              <label className="label">Energia Renovable Producidas</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="renewable_energies_produced .value"
                onChange={formik.handleChange}
                value={formik.values.renewable_energies_produced.value}
                error={formik.errors.renewable_energies_produced}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("renewable_energies_produced .isApproved", data.value)
                }
                value={formik.values.renewable_energies_produced.isApproved}
                error={formik.errors.renewable_energies_produced}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Energias renovables producidas", "");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Energias renovables producidas");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>



          
          <Table.Row>
            <Table.Cell>
              <label className="label">Vapor</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="steam.value"
                onChange={formik.handleChange}
                value={formik.values.steam.value}
                error={formik.errors.steam}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("steam.isApproved", data.value)
                }
                value={formik.values.steam.isApproved}
                error={formik.errors.steam}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Vapor", "");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Vapor");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>



          <Table.Row>
            <Table.Cell>
              <label className="label">Costo de vapor</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("steam_cost.value", data.value)
                }
                value={formik.values.steam_cost.value}
                error={formik.errors.steam_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("steam_cost.isApproved", data.value)
                }
                value={formik.values.steam_cost.isApproved}
                error={formik.errors.steam_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de vapor", "steam_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("steam_cost.value", data.value)
                }
                value={formik.values.steam_cost.value}
                error={formik.errors.steam_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("steam_cost.isApproved", data.value)
                }
                value={formik.values.steam_cost.isApproved}
                error={formik.errors.steam_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo de vapor", "steam_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Costo de vapor", "steam_cost");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>





          <Table.Row>
            <Table.Cell>
              <label className="label">Gas Natural</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="natural_gas.value"
                onChange={formik.handleChange}
                value={formik.values.natural_gas.value}
                error={formik.errors.natural_gas}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("natural_gas.isApproved", data.value)
                }
                value={formik.values.natural_gas.isApproved}
                error={formik.errors.natural_gas}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Vapor", "");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Gas natural");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>



          <Table.Row>
            <Table.Cell>
              <label className="label">Costo de gas natural</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("natural_gas_cost.value", data.value)
                }
                value={formik.values.natural_gas_cost.value}
                error={formik.errors.natural_gas_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("natural_gas_cost.isApproved", data.value)
                }
                value={formik.values.natural_gas_cost.isApproved}
                error={formik.errors.natural_gas_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de gas natural", "natural_gas_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("natural_gas_cost.value", data.value)
                }
                value={formik.values.natural_gas_cost.value}
                error={formik.errors.natural_gas_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("natural_gas_cost.isApproved", data.value)
                }
                value={formik.values.natural_gas_cost.isApproved}
                error={formik.errors.natural_gas_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo de gas natural", "natural_gas_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>





          <Table.Row>
            <Table.Cell>
              <label className="label">Gas licuado de petroleo</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="renewable_Energies.value"
                onChange={formik.handleChange}
                value={formik.values.liquefied_petroleum_gas.value}
                error={formik.errors.liquefied_petroleum_gas}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("liquefied_petroleum_gas.isApproved", data.value)
                }
                value={formik.values.liquefied_petroleum_gas.isApproved}
                error={formik.errors.liquefied_petroleum_gas}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Gas licuado de petroleo", "liquefied_petroleum_gas");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo gas licuado de petroleo</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("liquefied_petroleum_gas_cost.value", data.value)
                }
                value={formik.values.liquefied_petroleum_gas_cost.value}
                error={formik.errors.liquefied_petroleum_gas_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("liquefied_petroleum_gas_cost.isApproved", data.value)
                }
                value={formik.values.liquefied_petroleum_gas_cost.isApproved}
                error={formik.errors.liquefied_petroleum_gas_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de gas licuado de petroleo", "liquefied_petroleum_gas_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("liquefied_petroleum_gas_cost.value", data.value)
                }
                value={formik.values.liquefied_petroleum_gas_cost.value}
                error={formik.errors.liquefied_petroleum_gas_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("liquefied_petroleum_gas_cost.isApproved", data.value)
                }
                value={formik.values.liquefied_petroleum_gas_cost.isApproved}
                error={formik.errors.liquefied_petroleum_gas_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo de gas licuado de petroleo", "liquefied_petroleum_gas_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>



        


          


          <Table.Row>
            <Table.Cell>
              <label className="label">Aceite combustible</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="renewable_Energies.value"
                onChange={formik.handleChange}
                value={formik.values.heavy_fuel_oil.value}
                error={formik.errors.heavy_fuel_oil}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("heavy_fuel_oil.isApproved", data.value)
                }
                value={formik.values.heavy_fuel_oil.isApproved}
                error={formik.errors.heavy_fuel_oil}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Aceite combustible", "heavy_fuel_oil");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo aceite combustible</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("heavy_fuel_oil_cost.value", data.value)
                }
                value={formik.values.heavy_fuel_oil_cost.value}
                error={formik.errors.heavy_fuel_oil_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("heavy_fuel_oil_cost.isApproved", data.value)
                }
                value={formik.values.heavy_fuel_oil_cost.isApproved}
                error={formik.errors.heavy_fuel_oil_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo aceite combustible", "heavy_fuel_oil_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("heavy_fuel_oil_cost.value", data.value)
                }
                value={formik.values.heavy_fuel_oil_cost.value}
                error={formik.errors.heavy_fuel_oil_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("heavy_fuel_oil_cost.isApproved", data.value)
                }
                value={formik.values.heavy_fuel_oil_cost.isApproved}
                error={formik.errors.heavy_fuel_oil_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo aceite combustible", "heavy_fuel_oil_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>


          

          <Table.Row>
            <Table.Cell>
              <label className="label">Aceite combustible liviano</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="light_fuel_oil"
                onChange={formik.handleChange}
                value={formik.values.light_fuel_oil.value}
                error={formik.errors.light_fuel_oil}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("light_fuel_oil.isApproved", data.value)
                }
                value={formik.values.light_fuel_oil.isApproved}
                error={formik.errors.light_fuel_oil}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Aceite combustible liviano", "light_fuel_oil");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo aceite combustible liviano</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("light_fuel_oil_cost.value", data.value)
                }
                value={formik.values.light_fuel_oil_cost.value}
                error={formik.errors.light_fuel_oil_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("light_fuel_oil_cost.isApproved", data.value)
                }
                value={formik.values.light_fuel_oil_cost.isApproved}
                error={formik.errors.light_fuel_oil_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo aceite combustible liviano", "light_fuel_oil_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("light_fuel_oil_cost.value", data.value)
                }
                value={formik.values.light_fuel_oil_cost.value}
                error={formik.errors.light_fuel_oil_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("light_fuel_oil_cost.isApproved", data.value)
                }
                value={formik.values.light_fuel_oil_cost.isApproved}
                error={formik.errors.light_fuel_oil_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo aceite combustible liviano", "light_fuel_oil_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>








          <Table.Row>
            <Table.Cell>
              <label className="label">Carbon</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="light_fuel_oil"
                onChange={formik.handleChange}
                value={formik.values.coal.value}
                error={formik.errors.coal }
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("coal.isApproved", data.value)
                }
                value={formik.values.coal.isApproved}
                error={formik.errors.coal }
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Carbon", "coal");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo carbon</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("coal_cost.value", data.value)
                }
                value={formik.values.coal_cost.value}
                error={formik.errors.coal_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("coal_cost.isApproved", data.value)
                }
                value={formik.values.coal_cost.isApproved}
                error={formik.errors.coal_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo coal", "coal_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("coal_cost.value", data.value)
                }
                value={formik.values.coal_cost.value}
                error={formik.errors.coal_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("coal_cost.isApproved", data.value)
                }
                value={formik.values.coal_cost.isApproved}
                error={formik.errors.coal_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo carbon", "coal_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>





          
          <Table.Row>
            <Table.Cell>
              <label className="label">Diesel</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="diesel"
                onChange={formik.handleChange}
                value={formik.values.diesel.value}
                error={formik.errors.diesel}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("diesel.isApproved", data.value)
                }
                value={formik.values.diesel.isApproved}
                error={formik.errors.diesel }
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Diesel", "diesel");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo diesel</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("diesel_cost.value", data.value)
                }
                value={formik.values.diesel_cost.value}
                error={formik.errors.diesel_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("diesel_cost.isApproved", data.value)
                }
                value={formik.values.diesel_cost.isApproved}
                error={formik.errors.diesel_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo diesel", "diesel_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("diesel_cost.value", data.value)
                }
                value={formik.values.diesel_cost.value}
                error={formik.errors.diesel_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("diesel_cost.isApproved", data.value)
                }
                value={formik.values.diesel_cost.isApproved}
                error={formik.errors.diesel_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo diesel", "diesel_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>


          <Table.Row>
            <Table.Cell>
              <label className="label">Gasolina vehiculos internos</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="gasoline_for_internal_vehicles"
                onChange={formik.handleChange}
                value={formik.values.gasoline_for_internal_vehicles.value}
                error={formik.errors.gasoline_for_internal_vehicles}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("gasoline_for_internal_vehicles.isApproved", data.value)
                }
                value={formik.values.gasoline_for_internal_vehicles.isApproved}
                error={formik.errors.gasoline_for_internal_vehicles}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Asolina para vehiculos internos", "gasoline_for_internal_vehicles");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo gasolina de vehiculos internos</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("gasoline_for_internal_vehicles_cost.value", data.value)
                }
                value={formik.values.gasoline_for_internal_vehicles_cost.value}
                error={formik.errors.gasoline_for_internal_vehicles_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("gasoline_for_internal_vehicles_cost.isApproved", data.value)
                }
                value={formik.values.gasoline_for_internal_vehicles_cost.isApproved}
                error={formik.errors.gasoline_for_internal_vehicles_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de gasolina para veiculos intrernos", "gasoline_for_internal_vehicles_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("gasoline_for_internal_vehicles_cost.value", data.value)
                }
                value={formik.values.gasoline_for_internal_vehicles_cost.value}
                error={formik.errors.gasoline_for_internal_vehicles_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("gasoline_for_internal_vehicles_cost.isApproved", data.value)
                }
                value={formik.values.gasoline_for_internal_vehicles_cost.isApproved}
                error={formik.errors.gasoline_for_internal_vehicles_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo de gasolina para vheiculos internos", "gasoline_for_internal_vehicles_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>



          <Table.Row>
            <Table.Cell>
              <label className="label">Biomasa</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="biomass"
                onChange={formik.handleChange}
                value={formik.values.biomass.value}
                error={formik.errors.biomass}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.days_month.isApproved}
                label={
                  formik.values.days_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("days_month.isApproved", checked);
                }}
              /> */}
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={["Aprobado", "No aprobado"].map((ds) => {
                  return {
                    key: ds,
                    text: ds,
                    value: ds,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("days_month.isApproved", data.value)
                }
                value={formik.values.days_month.isApproved}
                error={formik.errors.days_month}
              /> */}
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
                  formik.setFieldValue("biomass.isApproved", data.value)
                }
                value={formik.values.biomass.isApproved}
                error={formik.errors.biomass}
              />
              {/* {formik.values.days_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Biomasa", "biomass");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categotris de producto");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>




          <Table.Row>
            <Table.Cell>
              <label className="label">Costo Biomasa</label> 
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[{ _id: "1", name: "name" }].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("biomass_cost.value", data.value)
                }
                value={formik.values.biomass_cost.value}
                error={formik.errors.biomass_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Dropdown
                placeholder="Seleccione"
                options={[{value:true,name:"Aprobado"}, {value:false,name:"No aprobado"}].map((ds) => {
                  return {
                    key: ds.value,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.isApproved", data.value)
                }
              /> */}

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
                  formik.setFieldValue("biomass_cost.isApproved", data.value)
                }
                value={formik.values.biomass_cost.isApproved}
                error={formik.errors.biomass_cost}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Costo de biomasa", "biomass_cost");
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
              <label className="label">Moneda</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Seleccione"
                options={[{_id:"1",name:" $ Arg "}, {_id:"2",name:"US$"}, {_id:"3",name:"R$"},{_id:"4",name:"$ Mxn"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("biomass_cost.value", data.value)
                }
                value={formik.values.biomass_cost.value}
                error={formik.errors.biomass_cost}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.product_category.isApproved}
                label={
                  formik.values.product_category.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("product_category.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("biomass_cost.isApproved", data.value)
                }
                value={formik.values.biomass_cost.isApproved}
                error={formik.errors.biomass_cost}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Costo de biomasa", "biomass_cost");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de producto", "");
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
                name="hours_month.value"
                onChange={formik.handleChange}
                value={formik.values.hours_month.value}
                error={formik.errors.hours_month}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.hours_month.isApproved}
                label={
                  formik.values.hours_month.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("hours_month.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("hours_month.isApproved", data.value)
                }
                value={formik.values.hours_month.isApproved}
                error={formik.errors.hours_month}
              />
              {/* {formik.values.hours_month.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Horas trabajadas en el mes", "hours_month");
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
                name="hours_total.value"
                disabled={true}
                onChange={formik.handleChange}
                value={formik.values.hours_total.value}
                error={formik.errors.hours_total}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.hours_total.isApproved}
                label={
                  formik.values.hours_total.isApproved ? "Aprobado" : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("hours_total.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("hours_total.isApproved", data.value)
                }
                value={formik.values.hours_total.isApproved}
                error={formik.errors.hours_total}
              />
              {/* {formik.values.hours_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Horas totales trabajadas", "hours_total");
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
                name="temporary_workers.value"
                onChange={formik.handleChange}
                value={formik.values.temporary_workers.value}
                error={formik.errors.temporary_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.temporary_workers.isApproved}
                label={
                  formik.values.temporary_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue("temporary_workers.isApproved", checked);
                }}
              /> */}
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
                  formik.setFieldValue("temporary_workers.isApproved", data.value)
                }
                value={formik.values.temporary_workers.isApproved}
                error={formik.errors.temporary_workers}
              />
              {/* {formik.values.temporary_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadores temporales",
                    "temporary_workers"
                  );
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
                name="permanent_production_workers.value"
                onChange={formik.handleChange}
                value={formik.values.permanent_production_workers.value}
                error={formik.errors.permanent_production_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.permanent_production_workers.isApproved}
                label={
                  formik.values.permanent_production_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "permanent_production_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("permanent_production_workers.isApproved", data.value)
                }
                value={formik.values.permanent_production_workers.isApproved}
                error={formik.errors.permanent_production_workers}
              />
              {/* {formik.values.permanent_production_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadores de produccion permanentes",
                    "permanent_production_workers"
                  );
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
                name="permanent_administrative_workers.value"
                onChange={formik.handleChange}
                value={formik.values.permanent_administrative_workers.value}
                error={formik.errors.permanent_administrative_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={
                  formik.values.permanent_administrative_workers.isApproved
                }
                label={
                  formik.values.permanent_administrative_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "permanent_administrative_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("permanent_administrative_workers.isApproved", data.value)
                }
                value={formik.values.permanent_administrative_workers.isApproved}
                error={formik.errors.permanent_administrative_workers}
              />
              {/* {formik.values.permanent_administrative_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadores administrativos permanentes",
                    "permanent_administrative_workers"
                  );
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
                name="female_production_workers.value"
                onChange={formik.handleChange}
                value={formik.values.female_production_workers.value}
                error={formik.errors.female_production_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.female_production_workers.isApproved}
                label={
                  formik.values.female_production_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "female_production_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("female_production_workers.isApproved", data.value)
                }
                value={formik.values.female_production_workers.isApproved}
                error={formik.errors.female_production_workers}
              />
              {/* {formik.values.female_production_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadoras de produccion femeninas",
                    "female_production_workers"
                  );
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
                name="male_production_workers.value"
                onChange={formik.handleChange}
                value={formik.values.male_production_workers.value}
                error={formik.errors.male_production_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.male_production_workers.isApproved}
                label={
                  formik.values.male_production_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "male_production_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("male_production_workers.isApproved", data.value)
                }
                value={formik.values.male_production_workers.isApproved}
                error={formik.errors.male_production_workers}
              />
              {/* {formik.values.male_production_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadores de produccion masculinos",
                    "male_production_workers"
                  );
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
                name="female_administrative_workers.value"
                onChange={formik.handleChange}
                value={formik.values.female_administrative_workers.value}
                error={formik.errors.female_administrative_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.female_administrative_workers.isApproved}
                label={
                  formik.values.female_administrative_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "female_administrative_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("female_administrative_workers.isApproved", data.value)
                }
                value={formik.values.female_administrative_workers.isApproved}
                error={formik.errors.female_administrative_workers}
              />
              {/* {formik.values.female_administrative_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadoras administrativas femeninas",
                    "female_administrative_workers"
                  );
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
                name="male_administrative_workers.value"
                onChange={formik.handleChange}
                value={formik.values.male_administrative_workers.value}
                error={formik.errors.male_administrative_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.male_administrative_workers.isApproved}
                label={
                  formik.values.male_administrative_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "male_administrative_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("male_administrative_workers.isApproved", data.value)
                }
                value={formik.values.male_administrative_workers.isApproved}
                error={formik.errors.male_administrative_workers}
              />
              {/* {formik.values.male_administrative_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadores administrativos masculinos",
                    "male_administrative_workers"
                  );
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
                name="female_workers_leadership_position.value"
                onChange={formik.handleChange}
                value={formik.values.female_workers_leadership_positions.value}
                error={formik.errors.female_workers_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={
                  formik.values.female_workers_leadership_positions.isApproved
                }
                label={
                  formik.values.female_workers_leadership_positions.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "female_workers_leadership_positions.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("female_workers_leadership_positions.isApproved", data.value)
                }
                value={formik.values.female_workers_leadership_positions.isApproved}
                error={formik.errors.female_workers_leadership_positions}
              />
              {/* {formik.values.female_workers_leadership_positions.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadoras femeninas en posiciones de liderazgo",
                    "female_workers_leadership_positions"
                  );
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
                name="male_workers_leadership_positions.value"
                onChange={formik.handleChange}
                value={formik.values.male_workers_leadership_positions.value}
                error={formik.errors.male_workers_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={
                  formik.values.male_workers_leadership_positions.isApproved
                }
                label={
                  formik.values.male_workers_leadership_positions.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "male_workers_leadership_positions.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("male_workers_leadership_positions.isApproved", data.value)
                }
                value={formik.values.male_workers_leadership_positions.isApproved}
                error={formik.errors.male_workers_leadership_positions}
              />
              {/* {formik.values.male_workers_leadership_positions.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad de trabajadores masculinos en posiciones de liderazgo",
                    "male_workers_leadership_positions"
                  );
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
                name="average_total_workers.value"
                onChange={formik.handleChange}
                value={formik.values.average_total_workers.value}
                error={formik.errors.average_total_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.average_total_workers.isApproved}
                label={
                  formik.values.average_total_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "average_total_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("average_total_workers.isApproved", data.value)
                }
                value={formik.values.average_total_workers.isApproved}
                error={formik.errors.average_total_workers}
              />
              {/* {formik.values.average_total_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cantidad promedio de trabajadores totales",
                    "average_total_workers"
                  );
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
                name="average_female_workers.value"
                onChange={formik.handleChange}
                value={formik.values.average_female_workers.value}
                error={formik.errors.average_female_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.average_female_workers.isApproved}
                label={
                  formik.values.average_female_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "average_female_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("average_female_workers.isApproved", data.value)
                }
                value={formik.values.average_female_workers.isApproved}
                error={formik.errors.average_female_workers}
              />
              {/* {formik.values.average_female_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Promedio de trabajadoras femeninas",
                    "average_female_workers"
                  );
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
                name="average_male_workers.value"
                onChange={formik.handleChange}
                value={formik.values.average_male_workers.value}
                error={formik.errors.average_male_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.average_male_workers.isApproved}
                label={
                  formik.values.average_male_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "average_male_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("average_male_workers.isApproved", data.value)
                }
                value={formik.values.average_male_workers.isApproved}
                error={formik.errors.average_male_workers}
              />
              {/* {formik.values.average_male_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Promedio de trabajadores masculinos",
                    "average_male_workers"
                  );
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
                name="percentage_female_workers.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_female_workers.value}
                error={formik.errors.percentage_female_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.percentage_female_workers.isApproved}
                label={
                  formik.values.percentage_female_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "percentage_female_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("percentage_female_workers.isApproved", data.value)
                }
                value={formik.values.percentage_female_workers.isApproved}
                error={formik.errors.percentage_female_workers}
              />
              {/* {formik.values.percentage_female_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "% de trabajadoras femeninas",
                    "percentage_female_workers"
                  );
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
                name="percentage_female_workers.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_male_workers.value}
                error={formik.errors.percentage_male_workers}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.percentage_male_workers.isApproved}
                label={
                  formik.values.percentage_male_workers.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "percentage_male_workers.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("percentage_male_workers.isApproved", data.value)
                }
                value={formik.values.percentage_male_workers.isApproved}
                error={formik.errors.percentage_male_workers}
              />
              {/* {formik.values.percentage_male_workers.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "% de trabajadores masculinos",
                    "percentage_male_workers"
                  );
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
                name="percentage_total_female.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_total_female.value}
                error={formik.errors.percentage_total_female}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.percentage_total_female.isApproved}
                label={
                  formik.values.percentage_total_female.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "percentage_total_female.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("percentage_total_female.isApproved", data.value)
                }
                value={formik.values.percentage_total_female.isApproved}
                error={formik.errors.percentage_total_female}
              />
              {/* {formik.values.percentage_total_female.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "% de mujeres totales",
                    "percentage_total_female"
                  );
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
                name="percentage_total_male.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_total_male.value}
                error={formik.errors.percentage_total_male}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.percentage_total_male.isApproved}
                label={
                  formik.values.percentage_total_male.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "percentage_total_male.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("percentage_total_male.isApproved", data.value)
                }
                value={formik.values.percentage_total_male.isApproved}
                error={formik.errors.percentage_total_male}
              />
              {/* {formik.values.percentage_total_male.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "% de hombres totales",
                    "percentage_total_male"
                  );
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
                name="percentage_female_leadership_positions.value"
                onChange={formik.handleChange}
                value={
                  formik.values.percentage_female_leadership_positions.value
                }
                error={formik.errors.percentage_female_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={
                  formik.values.percentage_female_leadership_positions
                    .isApproved
                }
                label={
                  formik.values.percentage_female_leadership_positions
                    .isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "percentage_female_leadership_positions.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("percentage_female_leadership_positions.isApproved", data.value)
                }
                value={formik.values.percentage_female_leadership_positions.isApproved}
                error={formik.errors.percentage_female_leadership_positions}
              />
              {/* {formik.values.percentage_female_leadership_positions.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "% de femeninas en posicion de liderazgo",
                    "percentage_female_leadership_positions"
                  );
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
                name="percentage_male_leadership_positions.value"
                onChange={formik.handleChange}
                value={formik.values.percentage_male_leadership_positions.value}
                error={formik.errors.percentage_male_leadership_positions}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={
                  formik.values.percentage_male_leadership_positions.isApproved
                }
                label={
                  formik.values.percentage_male_leadership_positions.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "percentage_male_leadership_positions.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("percentage_male_leadership_positions.isApproved", data.value)
                }
                value={formik.values.percentage_male_leadership_positions.isApproved}
                error={formik.errors.percentage_male_leadership_positions}
              />
              {/* {formik.values.percentage_male_leadership_positions.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "% de masculinos en posicion de liderazgo",
                    "percentage_male_leadership_positions"
                  );
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
                name="work_accidents_with_sick_days.value"
                onChange={formik.handleChange}
                value={formik.values.work_accidents_with_sick_days.value}
                error={formik.errors.work_accidents_with_sick_days}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.work_accidents_with_sick_days.isApproved}
                label={
                  formik.values.work_accidents_with_sick_days.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "work_accidents_with_sick_days.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("work_accidents_with_sick_days.isApproved", data.value)
                }
                value={formik.values.work_accidents_with_sick_days.isApproved}
                error={formik.errors.work_accidents_with_sick_days}
              />
              {/* {formik.values.work_accidents_with_sick_days.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Accidentes de trabajo con dias de baja (+ de uno)",
                    "work_accidents_with_sick_days"
                  );
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
                name="first_aid_without_sick_days.value"
                onChange={formik.handleChange}
                value={formik.values.first_aid_without_sick_days.value}
                error={formik.errors.first_aid_without_sick_days}
              />
            </Table.Cell>
            <Table.Cell>
              {/* <Form.Checkbox
                toggle
                checked={formik.values.first_aid_without_sick_days.isApproved}
                label={
                  formik.values.first_aid_without_sick_days.isApproved
                    ? "Aprobado"
                    : "Aprobado"
                }
                onChange={(e, { checked }) => {
                  formik.setFieldValue(
                    "first_aid_without_sick_days.isApproved",
                    checked
                  );
                }}
              /> */}
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
                  formik.setFieldValue("first_aid_without_sick_days.isApproved", data.value)
                }
                value={formik.values.first_aid_without_sick_days.isApproved}
                error={formik.errors.first_aid_without_sick_days}
              />
              {/* {formik.values.first_aid_without_sick_days.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Primeros auxilios sin dias de baja (continua trabajando)",
                    "first_aid_without_sick_days"
                  );
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
