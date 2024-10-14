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
import { Dangerousform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./DangerousForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import { PERIODS } from "../../../../utils";
import { convertDangerousFieldsEngToEsp, convertPeriodsEngToEsp } from "../../../../utils/converts";
import "./DangerousForm.scss";

const dangerousFormController = new Dangerousform();

export function DangerousForm(props) {
  const { onClose, onReload, dangerousForm, siteSelected , year, period} = props;
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
    initialValues: initialValues(dangerousForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!dangerousForm) {
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
            //   if (!dangerousForm) {
            //     //const siteData = decrypt(siteSelected);
            //     //formValue.site = siteData;
            //     formValue.site = siteSelected;
            //   }
            // }
          }
          await dangerousFormController.createDangerousForm(
            accessToken,
            formValue
          );
          //console.log(formValue);
        } else {
          await dangerousFormController.updateDangerousForm(
            accessToken,
            dangerousForm._id,
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
    navigate(`/admin/data/dangerousforms`, {
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
          await dangerousFormController.getPeriodsDangerousFormsBySiteAndYear(
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
    <Form className="dangerous-form" onSubmit={formik.handleSubmit}>
      {dangerousForm ? (
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
      {!dangerousForm ? (
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
            <Table.HeaderCell width="2">Valor</Table.HeaderCell>
            <Table.HeaderCell width="2">Unidad</Table.HeaderCell>
            <Table.HeaderCell width="2">Estado</Table.HeaderCell>
            <Table.HeaderCell>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.chemicals_sent_to_reuse_or_recycle.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("chemicals_sent_to_reuse_or_recycle")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                name="chemicals_sent_to_reuse_or_recycle.value"
                onChange={formik.handleChange}
                value={formik.values.chemicals_sent_to_reuse_or_recycle.value}
                error={formik.errors.chemicals_sent_to_reuse_or_recycle}
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
                  formik.setFieldValue("chemicals_sent_to_reuse_or_recycle.isApproved", data.value)
                }
                value={formik.values.chemicals_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.chemicals_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>


            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "chemicals_sent_to_reuse_or_recycle.isApproved",
                    data.value
                  )
                }
                value={formik.values.chemicals_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.chemicals_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.chemicals_sent_to_reuse_or_recycle.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("chemicals_sent_to_reuse_or_recycle"),
                    "chemicals_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  // openUpdateSite(convertDangerousFieldsEngToEsp("chemicals_sent_to_reuse_or_recycle"), "chemicals_sent_to_reuse_or_recycle");
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.lubricants_sent_to_reuse_or_recycle.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("lubricants_sent_to_reuse_or_recycle")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="lubricants_sent_to_reuse_or_recycle.value"
                value={formik.values.lubricants_sent_to_reuse_or_recycle.value}
                error={formik.errors.lubricants_sent_to_reuse_or_recycle}
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
                  formik.setFieldValue("lubricants_sent_to_reuse_or_recycle.isApproved", data.value)
                }
                value={formik.values.lubricants_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.lubricants_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "lubricants_sent_to_reuse_or_recycle.isApproved",
                    data.value
                  )
                }
                value={formik.values.lubricants_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.lubricants_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.lubricants_sent_to_reuse_or_recycle.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("lubricants_sent_to_reuse_or_recycle"),
                    "lubricants_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("lubricants_sent_to_reuse_or_recycle"),
                    "lubricants_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.oils_sent_to_reuse_or_recycle.code}{" "}
              </label>
            </Table.Cell>

            <Table.Cell>
              <label className="label">
              {convertDangerousFieldsEngToEsp("oils_sent_to_reuse_or_recycle")}
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="oils_sent_to_reuse_or_recycle.value"
                value={
                  formik.values.oils_sent_to_reuse_or_recycle.value
                }
                error={formik.errors.oils_sent_to_reuse_or_recycle}
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
                  formik.setFieldValue("oils_sent_to_reuse_or_recycle.isApproved", data.value)
                }
                value={formik.values.oils_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.oils_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "oils_sent_to_reuse_or_recycle.isApproved",
                    data.value
                  )
                }
                value={
                  formik.values.oils_sent_to_reuse_or_recycle.isApproved
                }
                error={formik.errors.oils_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("oils_sent_to_reuse_or_recycle"),
                    "oils_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("oils_sent_to_reuse_or_recycle"),
                    "oils_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.machines_and_equipment_sent_to_reuse_or_recycle.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">
                {convertDangerousFieldsEngToEsp("machines_and_equipment_sent_to_reuse_or_recycle")}
              </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="machines_and_equipment_sent_to_reuse_or_recycle.value"
                value={formik.values.machines_and_equipment_sent_to_reuse_or_recycle.value}
                error={formik.errors.machines_and_equipment_sent_to_reuse_or_recycle}
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
                  formik.setFieldValue("machines_and_equipment_sent_to_reuse_or_recycle", data.value)
                }
                value={formik.values.machines_and_equipment_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.machines_and_equipment_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
           
            
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "machines_and_equipment_sent_to_reuse_or_recycle.isApproved",
                    data.value
                  )
                }
                value={
                  formik.values.machines_and_equipment_sent_to_reuse_or_recycle.isApproved
                }
                error={formik.errors.machines_and_equipment_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.machines_and_equipment_sent_to_reuse_or_recycle.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("machines_and_equipment_sent_to_reuse_or_recycle"),
                    "machines_and_equipment_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("machines_and_equipment_sent_to_reuse_or_recycle"),
                    "machines_and_equipment_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.electronic_waste_sent_to_reuse_or_recycle.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("electronic_waste_sent_to_reuse_or_recycle")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electronic_waste_sent_to_reuse_or_recycle.value"
                value={formik.values.electronic_waste_sent_to_reuse_or_recycle.value}
                error={formik.errors.electronic_waste_sent_to_reuse_or_recycle}
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
                  formik.setFieldValue("electronic_waste_sent_to_reuse_or_recycle.isApproved", data.value)
                }
                value={formik.values.electronic_waste_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.electronic_waste_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>


            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "electronic_waste_sent_to_reuse_or_recycle.isApproved",
                    data.value
                  )
                }
                value={formik.values.electronic_waste_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.electronic_waste_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.product_category.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("electronic_waste_sent_to_reuse_or_recycle"),
                    "electronic_waste_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("electronic_waste_sent_to_reuse_or_recycle"),
                    "electronic_waste_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>


          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.other_dangerous_wastes_sent_to_reuse_or_recycle.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("other_dangerous_wastes_sent_to_reuse_or_recycle")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="other_dangerous_wastes_sent_to_reuse_or_recycle.value"
                value={formik.values.other_dangerous_wastes_sent_to_reuse_or_recycle.value}
                error={formik.errors.other_dangerous_wastes_sent_to_reuse_or_recycle}
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
                  formik.setFieldValue("other_dangerous_wastes_sent_to_reuse_or_recycle.isApproved", data.value)
                }
                value={formik.values.other_dangerous_wastes_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.other_dangerous_wastes_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>

            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "other_dangerous_wastes_sent_to_reuse_or_recycle.isApproved",
                    data.value
                  )
                }
                value={formik.values.other_dangerous_wastes_sent_to_reuse_or_recycle.isApproved}
                error={formik.errors.other_dangerous_wastes_sent_to_reuse_or_recycle}
              />
              {/* {formik.values.other_dangerous_wastes_sent_to_reuse_or_recycle.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("other_dangerous_wastes_sent_to_reuse_or_recycle"),
                    "other_dangerous_wastes_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("other_dangerous_wastes_sent_to_reuse_or_recycle"),
                    "other_dangerous_wastes_sent_to_reuse_or_recycle"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.chemicals_sent_to_incineration.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{ convertDangerousFieldsEngToEsp("chemicals_sent_to_incineration")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="chemicals_sent_to_incineration.value"
                value={formik.values.chemicals_sent_to_incineration.value}
                error={formik.errors.chemicals_sent_to_incineration}
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
                  formik.setFieldValue("chemicals_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.chemicals_sent_to_incineration.isApproved}
                error={formik.errors.chemicals_sent_to_incineration}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>

            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "chemicals_sent_to_incineration.isApproved",
                    data.value
                  )
                }
                value={formik.values.chemicals_sent_to_incineration.isApproved}
                error={formik.errors.chemicals_sent_to_incineration}
              />
              {/* {formik.values.chemicals_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("chemicals_sent_to_incineration"),
                    "chemicals_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("chemicals_sent_to_incineration"),
                    "chemicals_sent_to_incineration"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.lubricants_sent_to_incineration.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("lubricants_sent_to_incineration")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="lubricants_sent_to_incineration.value"
                value={formik.values.lubricants_sent_to_incineration.value}
                error={formik.errors.lubricants_sent_to_incineration}
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
                  formik.setFieldValue("lubricants_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.lubricants_sent_to_incineration.isApproved}
                error={formik.errors.lubricants_sent_to_incineration}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>

            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "lubricants_sent_to_incineration.isApproved",
                    data.value
                  )
                }
                value={formik.values.lubricants_sent_to_incineration.isApproved}
                error={formik.errors.lubricants_sent_to_incineration}
              />
              {/* {formik.values.lubricants_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("lubricants_sent_to_incineration"),
                    "lubricants_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("lubricants_sent_to_incineration"),
                    "lubricants_sent_to_incineration"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          
          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.oils_sent_to_incineration.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("oils_sent_to_incineration")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="oils_sent_to_incineration.value"
                value={formik.values.oils_sent_to_incineration.value}
                error={formik.errors.oils_sent_to_incineration}
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
                  formik.setFieldValue("oils_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.oils_sent_to_incineration.isApproved}
                error={formik.errors.oils_sent_to_incineration}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "oils_sent_to_incineration.isApproved",
                    data.value
                  )
                }
                value={formik.values.oils_sent_to_incineration.isApproved}
                error={formik.errors.oils_sent_to_incineration}
              />
              {/* {formik.values.oils_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("oils_sent_to_incineration"),
                    "oils_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("oils_sent_to_incineration"),
                    "oils_sent_to_incineration"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          
          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.machines_and_equipment_sent_to_incineration.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("machines_and_equipment_sent_to_incineration")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="machines_and_equipment_sent_to_incineration.value"
                value={formik.values.machines_and_equipment_sent_to_incineration.value}
                error={formik.errors.machines_and_equipment_sent_to_incineration}
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
                  formik.setFieldValue("machines_and_equipment_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.machines_and_equipment_sent_to_incineration.isApproved}
                error={formik.errors.machines_and_equipment_sent_to_incineration}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "machines_and_equipment_sent_to_incineration.isApproved",
                    data.value
                  )
                }
                value={formik.values.machines_and_equipment_sent_to_incineration.isApproved}
                error={formik.errors.machines_and_equipment_sent_to_incineration}
              />
              {/* {formik.values.machines_and_equipment_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("machines_and_equipment_sent_to_incineration"),
                    "machines_and_equipment_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("machines_and_equipment_sent_to_incineration"),
                    "machines_and_equipment_sent_to_incineration"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          
          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.electronic_waste_sent_to_incineration.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("electronic_waste_sent_to_incineration")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="electronic_waste_sent_to_incineration.value"
                value={formik.values.electronic_waste_sent_to_incineration.value}
                error={formik.errors.electronic_waste_sent_to_incineration}
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
                  formik.setFieldValue("electronic_waste_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.electronic_waste_sent_to_incineration.isApproved}
                error={formik.errors.electronic_waste_sent_to_incineration}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "electronic_waste_sent_to_incineration.isApproved",
                    data.value
                  )
                }
                value={formik.values.electronic_waste_sent_to_incineration.isApproved}
                error={formik.errors.electronic_waste_sent_to_incineration}
              />
              {/* {formik.values.electronic_waste_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("electronic_waste_sent_to_incineration"),
                    "electronic_waste_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("electronic_waste_sent_to_incineration"),
                    "electronic_waste_sent_to_incineration"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          
          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.other_dangerous_wastes_sent_to_incineration.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("other_dangerous_wastes_sent_to_incineration")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="other_dangerous_wastes_sent_to_incineration.value"
                value={formik.values.other_dangerous_wastes_sent_to_incineration.value}
                error={formik.errors.other_dangerous_wastes_sent_to_incineration}
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
                  formik.setFieldValue("other_dangerous_wastes_sent_to_incineration.isApproved", data.value)
                }
                value={formik.values.other_dangerous_wastes_sent_to_incineration.isApproved}
                error={formik.errors.other_dangerous_wastes_sent_to_incineration}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "other_dangerous_wastes_sent_to_incineration.isApproved",
                    data.value
                  )
                }
                value={formik.values.other_dangerous_wastes_sent_to_incineration.isApproved}
                error={formik.errors.other_dangerous_wastes_sent_to_incineration}
              />
              {/* {formik.values.other_dangerous_wastes_sent_to_incineration.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("other_dangerous_wastes_sent_to_incineration"),
                    "other_dangerous_wastes_sent_to_incineration"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("other_dangerous_wastes_sent_to_incineration"),
                    "other_dangerous_wastes_sent_to_incineration"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>
          
          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.chemicals_sent_to_landfill.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("chemicals_sent_to_landfill")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="chemicals_sent_to_landfill.value"
                value={formik.values.chemicals_sent_to_landfill.value}
                error={formik.errors.chemicals_sent_to_landfill}
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
                  formik.setFieldValue("chemicals_sent_to_landfill.isApproved", data.value)
                }
                value={formik.values.chemicals_sent_to_landfill.isApproved}
                error={formik.errors.chemicals_sent_to_landfill}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "chemicals_sent_to_landfill.isApproved",
                    data.value
                  )
                }
                value={formik.values.chemicals_sent_to_landfill.isApproved}
                error={formik.errors.chemicals_sent_to_landfill}
              />
              {/* {formik.values.chemicals_sent_to_landfill.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("chemicals_sent_to_landfill"),
                    "chemicals_sent_to_landfill"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("chemicals_sent_to_landfill"),
                    "chemicals_sent_to_landfill"
                  );
                }}
              >
                <Icon name="paperclip" />
              </Button>
            </Table.Cell>
          </Table.Row>

          <Table.Row>
            <Table.Cell>
              <label className="label">
                {formik.values.lubricants_sent_to_landfill.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertDangerousFieldsEngToEsp("lubricants_sent_to_landfill")}</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="lubricants_sent_to_landfill.value"
                value={formik.values.lubricants_sent_to_landfill.value}
                error={formik.errors.lubricants_sent_to_landfill}
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
                  formik.setFieldValue("lubricants_sent_to_landfill.isApproved", data.value)
                }
                value={formik.values.lubricants_sent_to_landfill.isApproved}
                error={formik.errors.lubricants_sent_to_landfill}
              />
              {/* {formik.values.days_total.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="Seleccione"
                options={[
                  { key: 1, value: true, name: "Aprobado" },
                  { key: 2, value: false, name: "No aprobado" },
                ].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue(
                    "lubricants_sent_to_landfill.isApproved",
                    data.value
                  )
                }
                value={formik.values.lubricants_sent_to_landfill.isApproved}
                error={formik.errors.lubricants_sent_to_landfill}
              />
              {/* {formik.values.chemicals_sent_to_landfill.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("lubricants_sent_to_landfill"),
                    "lubricants_sent_to_landfill"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    convertDangerousFieldsEngToEsp("lubricants_sent_to_landfill"),
                    "lubricants_sent_to_landfill"
                  );
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
          dangerousForm={dangerousForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!dangerousForm ? "Guardar" : "Actualizar datos"}
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
