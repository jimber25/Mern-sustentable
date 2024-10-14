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
import { Effluentform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./EffluentForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import { PERIODS } from "../../../../utils";
import { convertPeriodsEngToEsp } from "../../../../utils/converts";
import "./EffluentForm.scss";

const effluentFormController = new Effluentform();

export function EffluentForm(props) {
  const { onClose, onReload, effluentForm, siteSelected , year, period} = props;
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
    initialValues: initialValues(effluentForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!effluentForm) {
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
            //   if (!effluentForm) {
            //     //const siteData = decrypt(siteSelected);
            //     //formValue.site = siteData;
            //     formValue.site = siteSelected;
            //   }
            // }
          }
          await effluentFormController.createEffluentForm(
            accessToken,
            formValue
          );
          //console.log(formValue);
        } else {
          await effluentFormController.updateEffluentForm(
            accessToken,
            effluentForm._id,
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
    navigate(`/admin/data/effluentforms`, {
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
          await effluentFormController.getPeriodsEffluentFormsBySiteAndYear(
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
    <Form className="effluent-form" onSubmit={formik.handleSubmit}>
      {effluentForm ? (
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
      {!effluentForm ? (
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
                {formik.values.total_domestic_effluents.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">Total efluentes domésticos </label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                name="total_domestic_effluents.value"
                onChange={formik.handleChange}
                // onChange={(e, { name, value })=>
                //   formik.setFieldValue("total_domestic_effluents", value)
                // }
                value={formik.values.total_domestic_effluents.value}
                error={formik.errors.total_domestic_effluents}
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
                  formik.setFieldValue("total_domestic_effluents.isApproved", data.value)
                }
                value={formik.values.total_domestic_effluents.isApproved}
                error={formik.errors.total_domestic_effluents}
              />
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
                    "total_domestic_effluents.isApproved",
                    data.value
                  )
                }
                value={formik.values.total_domestic_effluents.isApproved}
                error={formik.errors.total_domestic_effluents}
              />
              {/* {formik.values.installation_type.isApproved?  <Icon color="green" name='checkmark' /> : <Icon color="red" name='close' />} */}
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(
                    "Total efluentes domésticos",
                    "total_domestic_effluents"
                  );
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
              <label className="label">
                {formik.values.total_industrial_effluents.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">Total efluentes industriales</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="total_industrial_effluents.value"
                value={formik.values.total_industrial_effluents.value}
                error={formik.errors.total_industrial_effluents}
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
                  formik.setFieldValue("total_industrial_effluents.isApproved", data.value)
                }
                value={formik.values.total_industrial_effluents.isApproved}
                error={formik.errors.total_industrial_effluents}
              />
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
                    "total_industrial_effluents.isApproved",
                    data.value
                  )
                }
                value={formik.values.total_industrial_effluents.isApproved}
                error={formik.errors.total_industrial_effluents}
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
                    "Total efluentes industriales",
                    "total_industrial_effluents"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    "Total efluentes industriales",
                    "total_industrial_effluents"
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
                {formik.values.sludge_mud_sent_for_disposal_landfill.code}{" "}
              </label>
            </Table.Cell>

            <Table.Cell>
              <label className="label">
                Lodos/ Barros enviados a disponer (relleno sanitario)
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
                name="sludge_mud_sent_for_disposal_landfill.value"
                value={
                  formik.values.sludge_mud_sent_for_disposal_landfill.value
                }
                error={formik.errors.sludge_mud_sent_for_disposal_landfill}
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
                  formik.setFieldValue("sludge_mud_sent_for_disposal_landfill.isApproved", data.value)
                }
                value={formik.values.sludge_mud_sent_for_disposal_landfill.isApproved}
                error={formik.errors.sludge_mud_sent_for_disposal_landfill}
              />
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
                    "sludge_mud_sent_for_disposal_landfill.isApproved",
                    data.value
                  )
                }
                value={
                  formik.values.sludge_mud_sent_for_disposal_landfill.isApproved
                }
                error={formik.errors.sludge_mud_sent_for_disposal_landfill}
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
                    "Lodos/ Barros enviados a disponer",
                    "sludge_mud_sent_for_disposal_landfill"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    "Lodos/ Barros enviados a disponer",
                    "sludge_mud_sent_for_disposal_landfill"
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
                {formik.values.total_effluents_per_unit_produced.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">
                Total efluentes por unidad producida
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
                name="total_effluents_per_unit_produced.value"
                value={formik.values.total_effluents_per_unit_produced.value}
                error={formik.errors.total_effluents_per_unit_produced}
              />
            </Table.Cell>
            <Table.Cell>
              <Form.Dropdown
                placeholder="m3/un"
                options={[{key:1, value:true,name:""}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("total_effluents_per_unit_produced.isApproved", data.value)
                }
                value={formik.values.total_effluents_per_unit_produced.isApproved}
                error={formik.errors.total_effluents_per_unit_produced}
              />
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
                    "total_effluents_per_unit_produced.isApproved",
                    data.value
                  )
                }
                value={
                  formik.values.total_effluents_per_unit_produced.isApproved
                }
                error={formik.errors.total_effluents_per_unit_produced}
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
                    "Total efluentes por unidad producida",
                    "total_effluents_per_unit_produced"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    "Total efluentes por unidad producida",
                    "total_effluents_per_unit_produced"
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
                {formik.values.percentage_domestic_effluents.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">% Efluentes domésticos</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="percentage_domestic_effluents.value"
                value={formik.values.percentage_domestic_effluents.value}
                error={formik.errors.percentage_domestic_effluents}
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
                  formik.setFieldValue("percentage_domestic_effluents.isApproved", data.value)
                }
                value={formik.values.percentage_domestic_effluents.isApproved}
                error={formik.errors.percentage_domestic_effluents}
              />
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
                    "percentage_domestic_effluents.isApproved",
                    data.value
                  )
                }
                value={formik.values.percentage_domestic_effluents.isApproved}
                error={formik.errors.percentage_domestic_effluents}
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
                    "% Efluentes domésticos",
                    "percentage_domestic_effluents"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    "% Efluentes domésticos",
                    "percentage_domestic_effluents"
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
                {formik.values.percentage_industrial_effluents.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">% Efluentes industriales</label>
            </Table.Cell>
            <Table.Cell>
              <Form.Input
                onKeyPress={(event) => {
                  if (!/[0-9]/.test(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={formik.handleChange}
                name="percentage_industrial_effluents.value"
                value={formik.values.percentage_industrial_effluents.value}
                error={formik.errors.percentage_industrial_effluents}
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
                  formik.setFieldValue("percentage_industrial_effluents.isApproved", data.value)
                }
                value={formik.values.percentage_industrial_effluents.isApproved}
                error={formik.errors.percentage_industrial_effluents}
              />
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
                    "percentage_industrial_effluents.isApproved",
                    data.value
                  )
                }
                value={formik.values.percentage_industrial_effluents.isApproved}
                error={formik.errors.percentage_industrial_effluents}
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
                    "% Efluentes industriales",
                    "percentage_industrial_effluents"
                  );
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite(
                    "% Efluentes industriales",
                    "percentage_industrial_effluents"
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
          effluentForm={effluentForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!effluentForm ? "Guardar" : "Actualizar datos"}
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
