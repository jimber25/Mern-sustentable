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
  GridRow
} from "semantic-ui-react";
import { useFormik, Field, FieldArray, FormikProvider, getIn } from "formik";
import { Wasteform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV, PERIODS } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./WasteForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import { convertPeriodsEngToEsp } from "../../../../utils/converts";
import "./WasteForm.scss";

const wasteFormController = new Wasteform();

export function WasteForm(props) {
  const { onClose, onReload, wasteForm, siteSelected , year, period } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [listPeriods, setListPeriods] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();

  const location = useLocation();

  console.log(siteSelected, year)
  //const { siteSelected } = location.state || {};

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
    initialValues: initialValues(wasteForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!wasteForm) {
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
            //   // if (!wasteForm) {
            //   //   const siteData = decrypt(siteSelected);
            //   //   formValue.site = siteData;
            //   // }
            // }
          }
          await wasteFormController.createWasteForm(accessToken, formValue);
          //console.log(formValue);
        } else {
          await wasteFormController.updateWasteForm(
            accessToken,
            wasteForm._id,
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
    navigate(`/admin/data/wasteforms`, {
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
          await wasteFormController.getPeriodsWasteFormsBySiteAndYear(
            accessToken,
            siteSelected,
            formik.values.year
          );
          console.log(response)
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
    <Form className="waste-form" onSubmit={formik.handleSubmit}>
      {wasteForm ? (
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
       {!wasteForm ? (
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
            <Table.HeaderCell width="6">Concepto</Table.HeaderCell>
            <Table.HeaderCell width="2">Valor</Table.HeaderCell>
            <Table.HeaderCell width="2">Unidad</Table.HeaderCell>
            <Table.HeaderCell width="2">Estado</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <label className="label">Papel y cartón enviado a reciclar o reutilizar</label>
            </Table.Cell>
            <Table.Cell>
                <Form.Input
                type="number"
                name="paper_and_cardboard_sent_to_recycling_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.value}
                error={formik.errors.paper_and_cardboard_sent_to_recycling_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("paper_and_cardboard_sent_to_recycling_or_reuse.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_recycling_or_reuse}
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
                  formik.setFieldValue("paper_and_cardboard_sent_to_recycling_or_reuse.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_recycling_or_reuse}
              />
              {/* {formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Papel y cartón enviado a reciclar o reutilizar", "paper_and_cardboard_sent_to_recycling_or_reuse");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite("Papel y cartón enviado a reciclar o reutilizar", "paper_and_cardboard_sent_to_recycling_or_reuse");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Plastico enviado a reciclar o reutilizar</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                type="number"
                name="plastic_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.plastic_sent_to_recycle_or_reuse.value}
                error={formik.errors.plastic_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("plastic_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.plastic_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.plastic_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("plastic_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.plastic_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.plastic_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.plastic_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Plastico enviado a reciclar o reutilizar", "plastic_sent_to_recycle_or_reuse");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Plastico enviado a reciclar o reutilizar", "plastic_sent_to_recycle_or_reuse");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>
              <label className="label">Tela enviada a reciclar o reutilizar</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="fabric_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.fabric_sent_to_recycle_or_reuse.value}
                error={formik.errors.fabric_sent_to_recycle_or_reuse}
              />


            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fabric_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.fabric_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.fabric_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
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
                  formik.setFieldValue("fabric_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.fabric_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.fabric_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.fabric_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Tela enviada a reciclar o reutilizar", "fabric_sent_to_recycle_or_reuse");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Tela enviada a reciclar o reutilizar");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Metal enviado a reciclar o reutilizar</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="metal_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.metal_sent_to_recycle_or_reuse.value}
                error={formik.errors.metal_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("metal_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.metal_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.metal_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("metal_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.metal_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.metal_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.metal_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Metal enviado a reciclar o reutilizar", "metal_sent_to_recycle_or_reuse");
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
              <label className="label">Madera enviada a reciclar o reutilizar</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="wood_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.wood_sent_to_recycle_or_reuse.value}
                error={formik.errors.wood_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("wood_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.wood_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.wood_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("wood_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.wood_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.wood_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.wood_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Madera enviada a reciclar o reutilizar", "wood_sent_to_recycle_or_reuse");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Madera enviada a reciclar o reutilizar");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Otros residuos generales enviados a reutilizar o reciclar</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="other_general_waste_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.other_general_waste_sent_to_recycle_or_reuse.value}
                error={formik.errors.other_general_waste_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("other_general_waste_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.other_general_waste_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.other_general_waste_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("other_general_waste_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.other_general_waste_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.other_general_waste_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.other_general_waste_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite("Otros residuos generales enviados a reutilizar o reciclar", "other_general_waste_sent_to_recycle_or_reuse");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Otros residuos generales enviados a reutilizar o reciclar");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
         

        

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Cueros enviados a reutilizar o reciclar
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="leathers_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.leathers_sent_to_recycle_or_reuse.value}
                error={formik.errors.leathers_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("leathers_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.leathers_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.leathers_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("leathers_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.leathers_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.leathers_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.leathers_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Cueros enviados a reutilizar o reciclar",
                    "leathers_sent_to_recycle_or_reuse"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Cueros enviados a reutilizar o reciclar");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Goma/caucho (rubber) enviados a reutilizar o reciclar
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="rubber_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.rubber_sent_to_recycle_or_reuse.value}
                error={formik.errors.rubber_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("rubber_sent_to_recycle_or_reuse", data.value)
                }
                value={formik.values.rubber_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.rubber_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("rubber_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.rubber_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.rubber_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.rubber_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Goma/caucho (rubber) enviados a reutilizar o reciclar",
                    "rubber_sent_to_recycle_or_reuse"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Goma/caucho (rubber) enviados a reutilizar o reciclar");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Restos de comida enviados a reutilizar o reciclar (compost)
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="food_scraps_sent_to_recycle_or_reuse.value"
                onChange={formik.handleChange}
                value={formik.values.food_scraps_sent_to_recycle_or_reuse.value}
                error={formik.errors.food_scraps_sent_to_recycle_or_reuse}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("food_scraps_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.food_scraps_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.food_scraps_sent_to_recycle_or_reuse}
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
                  formik.setFieldValue("food_scraps_sent_to_recycle_or_reuse.isApproved", data.value)
                }
                value={formik.values.food_scraps_sent_to_recycle_or_reuse.isApproved}
                error={formik.errors.food_scraps_sent_to_recycle_or_reuse}
              />
              {/* {formik.values.food_scraps_sent_to_recycle_or_reuse.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Restos de comida enviados a reutilizar o reciclar (compost)",
                    "food_scraps_sent_to_recycle_or_reuse"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Restos de comida enviados a reutilizar o reciclar (compost)");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Papel y cartón enviado a incineración
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="paper_and_cardboard_sent_to_incineration.value"
                onChange={formik.handleChange}
                value={formik.values.paper_and_cardboard_sent_to_incineration.value}
                error={formik.errors.paper_and_cardboard_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("paper_and_cardboard_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_incineration.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_incineration}
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
                  formik.setFieldValue("paper_and_cardboard_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_incineration.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_incineration}
              />
              {/* {formik.values.paper_and_cardboard_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Papel y cartón enviado a incineración",
                    "paper_and_cardboard_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Papel y cartón enviado a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Plastico enviado a incineración
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="plastic_sent_to_incineration.value"
                onChange={formik.handleChange}
                value={formik.values.plastic_sent_to_incineration.value}
                error={formik.errors.plastic_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("plastic_sent_to_incineration", data.value)
                }
                value={formik.values.plastic_sent_to_incineration.isApproved}
                error={formik.errors.plastic_sent_to_incineration}
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
                  formik.setFieldValue("plastic_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.plastic_sent_to_incineration.isApproved}
                error={formik.errors.plastic_sent_to_incineration}
              />
              {/* {formik.values.plastic_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Plastico enviado a incineración",
                    "plastic_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Plastico enviado a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Tela enviada a incineración
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="fabric_sent_to_incineration.value"
                onChange={formik.handleChange}
                value={formik.values.fabric_sent_to_incineration.value}
                error={formik.errors.fabric_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("fabric_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.fabric_sent_to_incineration.isApproved}
                error={formik.errors.fabric_sent_to_incineration}
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
                  formik.setFieldValue("fabric_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.fabric_sent_to_incineration.isApproved}
                error={formik.errors.fabric_sent_to_incineration}
              />
              {/* {formik.values.fabric_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Tela enviada a incineración",
                    "fabric_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Tela enviada a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Metal enviado a incineración
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="metal_sent_to_incineration.value"
                onChange={formik.handleChange}
                value={formik.values.metal_sent_to_incineration.value}
                error={formik.errors.metal_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("metal_sent_to_incineration", data.value)
                }
                value={formik.values.metal_sent_to_incineration.isApproved}
                error={formik.errors.metal_sent_to_incineration}
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
                  formik.setFieldValue("metal_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.metal_sent_to_incineration.isApproved}
                error={formik.errors.metal_sent_to_incineration}
              />
              {/* {formik.values.metal_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Metal enviado a incineración",
                    "metal_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Metal enviado a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Madera enviada a incineración
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="female_workers_leadership_position.value"
                onChange={formik.handleChange}
                value={formik.values.wood_sent_to_incineration.value}
                error={formik.errors.wood_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("wood_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.wood_sent_to_incineration.isApproved}
                error={formik.errors.wood_sent_to_incineration}
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
                  formik.setFieldValue("wood_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.wood_sent_to_incineration.isApproved}
                error={formik.errors.wood_sent_to_incineration}
              />
              {/* {formik.values.wood_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Madera enviada a incineración",
                    "wood_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Madera enviada a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Otros residuos generales enviados a incineración
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="other_general_waste_sent_to_incineration.value"
                onChange={formik.handleChange}
                value={formik.values.other_general_waste_sent_to_incineration.value}
                error={formik.errors.other_general_waste_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("other_general_waste_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.other_general_waste_sent_to_incineration.isApproved}
                error={formik.errors.other_general_waste_sent_to_incineration}
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
                  formik.setFieldValue("other_general_waste_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.other_general_waste_sent_to_incineration.isApproved}
                error={formik.errors.other_general_waste_sent_to_incineration}
              />
              {/* {formik.values.other_general_waste_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Otros residuos generales enviados a incineración",
                    "other_general_waste_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Otros residuos generales enviados a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Otros residuos generales enviados a otro tipo de disposición
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="other_general_waste_sent_to_other_types_of_disposal.value"
                onChange={formik.handleChange}
                value={formik.values.other_general_waste_sent_to_other_types_of_disposal.value}
                error={formik.errors.other_general_waste_sent_to_other_types_of_disposal}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("other_general_waste_sent_to_other_types_of_disposal.isApproved", data.value)
                }
                value={formik.values.other_general_waste_sent_to_other_types_of_disposal.isApproved}
                error={formik.errors.other_general_waste_sent_to_other_types_of_disposal}
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
                  formik.setFieldValue("other_general_waste_sent_to_other_types_of_disposal.isApproved", data.value)
                }
                value={formik.values.other_general_waste_sent_to_other_types_of_disposal.isApproved}
                error={formik.errors.other_general_waste_sent_to_other_types_of_disposal}
              />
              {/* {formik.values.other_general_waste_sent_to_other_types_of_disposal.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Otros residuos generales enviados a otro tipo de disposición",
                    "other_general_waste_sent_to_other_types_of_disposal"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Otros residuos generales enviados a otro tipo de disposición");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
              Total enviado a relleno sanitario
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="total_sent_to_landfill.value"
                onChange={formik.handleChange}
                value={formik.values.total_sent_to_landfill.value}
                error={formik.errors.total_sent_to_landfill}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_sent_to_landfill.isApproved", data.value)
                }
                value={formik.values.total_sent_to_landfill.isApproved}
                error={formik.errors.total_sent_to_landfill}
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
                  formik.setFieldValue("total_sent_to_landfill.isApproved", data.value)
                }
                value={formik.values.total_sent_to_landfill.isApproved}
                error={formik.errors.total_sent_to_landfill}
              />
              {/* {formik.values.total_sent_to_landfill.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Total enviado a relleno sanitario",
                    "total_sent_to_landfill"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Total enviado a relleno sanitario");
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
                name="total_sent_for_reuse_or_recycling.value"
                onChange={formik.handleChange}
                value={formik.values.total_sent_for_reuse_or_recycling.value}
                error={formik.errors.total_sent_for_reuse_or_recycling}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_sent_for_reuse_or_recycling.isApproved", data.value)
                }
                value={formik.values.total_sent_for_reuse_or_recycling.isApproved}
                error={formik.errors.total_sent_for_reuse_or_recycling}
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
                  formik.setFieldValue("total_sent_for_reuse_or_recycling.isApproved", data.value)
                }
                value={formik.values.total_sent_for_reuse_or_recycling.isApproved}
                error={formik.errors.total_sent_for_reuse_or_recycling}
              />
              {/* {formik.values.total_sent_for_reuse_or_recycling.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Total enviado a reutilización o reciclaje",
                    "total_sent_for_reuse_or_recycling"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Total enviado a reutilización o reciclaje");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Total enviado a incineración</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="total_sent_to_incineration.value"
                onChange={formik.handleChange}
                value={formik.values.total_sent_to_incineration.value}
                error={formik.errors.total_sent_to_incineration}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_recycling_or_reuse}
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
                  formik.setFieldValue("total_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.total_sent_to_incineration.isApproved}
                error={formik.errors.total_sent_to_incineration}
              />
              {/* {formik.values.total_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Total enviado a incineración",
                    "total_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Total enviado a incineración");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Total residuos generales enviados a otro tipo de disposición</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="total_general_waste_sent_to_other_types_of_disposal.value"
                onChange={formik.handleChange}
                value={formik.values.total_general_waste_sent_to_other_types_of_disposal.value}
                error={formik.errors.total_general_waste_sent_to_other_types_of_disposal}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_general_waste_sent_to_other_types_of_disposal.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_recycling_or_reuse}
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
                  formik.setFieldValue("total_general_waste_sent_to_other_types_of_disposal.isApproved", data.value)
                }
                value={formik.values.total_general_waste_sent_to_other_types_of_disposal.isApproved}
                error={formik.errors.total_general_waste_sent_to_other_types_of_disposal}
              />
              {/* {formik.values.total_general_waste_sent_to_other_types_of_disposal.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Total residuos generales enviados a otro tipo de disposición",
                    "total_general_waste_sent_to_other_types_of_disposal"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Total residuos generales enviados a otro tipo de disposición");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">Total residuos no peligrosos x unidad producida</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                type="number"
                name="total_non_hazardous_waste_unit_produced.value"
                onChange={formik.handleChange}
                value={formik.values.total_non_hazardous_waste_unit_produced.value}
                error={formik.errors.total_non_hazardous_waste_unit_produced}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                placeholder="Kg"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_non_hazardous_waste_unit_produced.isApproved", data.value)
                }
                value={formik.values.paper_and_cardboard_sent_to_recycling_or_reuse.isApproved}
                error={formik.errors.paper_and_cardboard_sent_to_recycling_or_reuse}
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
                  formik.setFieldValue("total_non_hazardous_waste_unit_produced.isApproved", data.value)
                }
                value={formik.values.total_non_hazardous_waste_unit_produced.isApproved}
                error={formik.errors.total_non_hazardous_waste_unit_produced}
              />
              {/* {formik.values.total_non_hazardous_waste_unit_produced.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Total residuos no peligrosos x unidad producida",
                    "total_non_hazardous_waste_unit_produced"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Total residuos no peligrosos x unidad producida");
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
          wasteForm={wasteForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!wasteForm ? "Guardar" : "Actualizar datos"}
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
