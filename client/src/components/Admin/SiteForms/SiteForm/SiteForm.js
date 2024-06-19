import React, { useCallback, useState } from "react";
import { Form, Image, Grid, Table, Icon, Button, Comment, CommentGroup, CommentContent, CommentMetadata, CommentText, CommentAuthor, Divider } from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import { useFormik, Field, FieldArray , FormikProvider, getIn} from "formik";
import { Siteform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV } from "../../../../utils";
import { formatDateView, formatDateHourCompleted } from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./SiteForm.form";
import "./SiteForm.scss";

const siteFormController = new Siteform();

export function SiteForm(props) {
  const { onClose, onReload, siteForm } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { user } = useAuth();

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateSite = (data, name) => {
    setFieldName(name);
    setTitleModal(`Comentarios ${data}`);
    onOpenCloseModal();
  };

  const formik = useFormik({
    initialValues: initialValues(siteForm),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!siteForm) {
          //await siteFormController.createSiteForm(accessToken, formValue);
          console.log(formValue)
        } else {
          await siteFormController.updateSiteForm(accessToken, siteForm._id, formValue);
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
                options={[{_id:1,name:"ppp"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("installation_type.value", data.value)
                }
                value={formik.values.installation_type.value}
                //value={getIn(formik.values, `installation_type.value`)}
                error={formik.errors.installation_type}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                   openUpdateSite("tipo de instalacion","installation_type");
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
                options={[{_id:1,name:"ppp"}].map((ds) => {
                  return {
                    key: ds._id,
                    text: ds.name,
                    value: ds._id,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("product_category.value", data.value)
                }
                value={formik.values.product_category.value}
                error={formik.errors.product_category}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                primary
                type="button"
                onClick={() => {
                  openUpdateSite("Categoria de productos","product_category");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <Button
                icon
                onClick={() => {
                  openUpdateSite("Categoria de productos", "product_category");
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

      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <Comments
          formik={formik}
          fieldName={fieldName}
          onClose={onOpenCloseModal}
          onReload={onReload}
          siteForm={siteForm}
          user={user}
        />
      </BasicModal>

      <Form.Button type="submit" primary fluid loading={formik.isSubmitting}>
        {!siteForm ? "Guardar" : "Actualizar datos"}
      </Form.Button>
    </Form>
  );
}

function Comments(props) {
  const { formik, user,  fieldName, onClose } = props;
  const [comment, setComment]=useState("");
  console.log(user)

  const onChangeHandle= () =>{
    if(comment && comment.length > 0){
      let data=formik.values[fieldName].reviews;
      data.push({
        "comment":comment,
        date:new Date(),
        reviewer_user:user? user._id: null
      });
      formik.setFieldValue(`${fieldName}.reviews`, data);
    }
    onClose()
  }   

  const handleSaveComment = (id, editedContent) => {
    let data=formik.values[fieldName].reviews;
    data[id].comment=editedContent;
    data[id].date=new Date();
    formik.setFieldValue(`${fieldName}.reviews`, data);
  };

  return (
    <>
      <CommentGroup minimal>
      {formik.values[fieldName].reviews && formik.values[fieldName].reviews.length > 0 ? (
                   formik.values[fieldName].reviews.map((review, index) => (
                <>
                  <EditableComment 
                  id={index}
                  author={review.reviewer_user? review.reviewer_user===user._id? user.firstname +" "+ user.lastname 
                    : review.reviewer_user.firstname + " " + review.reviewer_user.lastname : ""} 
                    date={formatDateHourCompleted(review.date)} 
                    content= {review.comment} 
                    onSave={handleSaveComment}
                    active={review.reviewer_user? review.reviewer_user===user._id? true: false : false}
                    />
                    <Divider fitted />
                    </>
                   ))
                 ) : (
             null
                 )}
       <Form.TextArea
      //  name={[fieldName].reviews.comments}
         placeholder=""
         rows={3}
        style={{ minHeight: 100,  width: "100%" }}
         // onChange={formik.handleChange}
         onChange={(_, data) => setComment(data.value)}
         value={formik.values[fieldName].reviews.comments}
         error={formik.errors[fieldName]}
       />
       <Form.Button type="button"  icon='edit'  content={"Añadir comentario"} primary fluid onClick={onChangeHandle}>
       </Form.Button>
       </CommentGroup>
    </>
  );
}

const EditableComment = ({id, author,date,  content, onSave, active }) => {
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
              <Form.TextArea
                value={editedContent}
                onChange={handleChange}
              />
              <Button content="Guardar" onClick={handleSave} primary />
              <Button content="Cancelar" onClick={handleCancel} secondary />
            </Form>
          ) : (
            <div>{editedContent}</div>
          )}
        </Comment.Text>
        {active?
        <Comment.Actions>
          <Comment.Action onClick={handleEdit}>Editar</Comment.Action>
        </Comment.Actions>
        : null}
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
