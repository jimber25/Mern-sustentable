import React, { useCallback,useRef, useState, useEffect } from "react";
import {
  Form,
  Label,
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
  Image,
  ModalActions,
  ModalHeader,
  ModalContent,
  ModalDescription
} from "semantic-ui-react";
import { useDropzone } from "react-dropzone";
import { useFormik, Field, FieldArray, FormikProvider, getIn } from "formik";
import { Productionform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { ENV, PERIODS } from "../../../../utils";
import {
  formatDateView,
  formatDateHourCompleted,
} from "../../../../utils/formatDate";
import { BasicModal } from "../../../Shared";
import { initialValues, validationSchema } from "./ProductionForm.form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { decrypt, encrypt } from "../../../../utils/cryptoUtils";
import "./ProductionForm.scss";
import { convertPeriodsEngToEsp, convertProductionFieldsEngToEsp } from "../../../../utils/converts";

const productionFormController = new Productionform();

export function ProductionForm(props) {
  const { onClose, onReload, productionForm, production, siteSelected, period, year } = props;
  const { accessToken } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [listPeriods, setListPeriods] = useState([]);
  const { user } = useAuth();

  const location = useLocation();
  const { productionSelected } = location.state || {};

  if (!productionSelected) {
    // // Manejo de caso donde no hay datos en state (por ejemplo, acceso directo a la URL)
    // return <div>No se encontraron detalles de producto.</div>;
  }

  const [data, setData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");

  const navigate = useNavigate();

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateSite = (data, name) => {
    setFieldName(name);
    setTitleModal(`Comentarios ${data}`);
    onOpenCloseModal();
  };

  const formik = useFormik({
    initialValues: initialValues(productionForm, period, year),
    validationSchema: validationSchema(),
    validateOnChange: false,
    onSubmit: async (formValue) => {
      try {
        if (!productionForm) {
          // if(data && Object.keys(data).length > 0){
          //   Object.entries(data).map(async ([d]) => {
          //     data[d].creator_user = user._id;
          //     data[d].date = new Date();
          //     if (user?.production) {
          //       data[d].site = user.production._id;
          //     } else {
          //       if (siteSelected) {
          //         data[d].site = siteSelected;
          //       }
          //     }
          //     await productionFormController.createProductionForm(accessToken, data[d]);
          //     return true;
          //     //console.log(formValue);
          // })


          // }else{
            formValue.creator_user = user._id;
            formValue.date = new Date();
            if (user?.production) {
              formValue.site = user.production._id;
            } else {
              if (siteSelected) {
                formValue.site = siteSelected;
              }
              // } else {
              //   // Desencriptar los datos recibidos
              //   if (!productionForm) {
              //     const productionData = decrypt(productionSelected);
              //     formValue.production = productionData;
              //   }
              // }
            }
            await productionFormController.createProductionForm(accessToken, formValue);
            //console.log(formValue);
          // }
    
        } else {
          await productionFormController.updateProductionForm(
            accessToken,
            productionForm._id,
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
    navigate(`/admin/data/productionforms`, {
      state: { productionSelected: productionSelected },
    });
  };

    // Generar una lista de años (por ejemplo, del 2000 al 2024)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  
    useEffect(() => {
      (async () => {
        try {
          const response =
            await productionFormController.getPeriodsProductionFormsBySiteAndYear(
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

    // const handleAdd = async () => {
    //   const validationErrors = await formik.validateForm();;
    //   console.log(Object.keys(validationErrors).length)
    //   if(Object.keys(validationErrors).length === 0){
    //     if (selectedMonth) {
    //       setData((prevData) => ({
    //         ...prevData,
    //         [selectedMonth]: formik.values,
    //       }));
    //       setSelectedMonth('');
    //     }
    //   }

    // };

    // useEffect(() => {
    //   (async () => {
    //     try {
    //       setSelectedMonth(formik.values.period)
    //     } catch (error) {
    //       console.error(error);
    //       setSelectedMonth("")
    //     }
    //   })();
    // }, [formik.values.period]);

  return (
    <Form className="production-form" onSubmit={formik.handleSubmit}>
      {productionForm ? (
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
            {!productionForm ? (
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
      {/* {
        data ?
        <>
              {console.log(data)}
        {Object.entries(data).map(([month, val]) => (
            <Label key={month}>
              {console.log(month)}
              {convertPeriodsEngToEsp(month)}
            </Label>
        ))}
        </>
        : null
      } */}
      <Table size="small" celled>
        <Table.Header>
          <Table.Row>
          <Table.HeaderCell width="1">Codigo</Table.HeaderCell>
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
                {formik.values.production_volume.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertProductionFieldsEngToEsp("production_volume")}</label>
            </Table.Cell>
            <Table.Cell>
            <Form.Input
                type="string"
                name="production_volume.value"
                onChange={formik.handleChange}
                value={formik.values.production_volume.value}
                error={formik.errors.production_volume?.value? formik.errors.production_volume.value : null}
              />
             
           
           </Table.Cell>

           <Table.Cell>
            <Form.Dropdown
                //placeholder="Celda datos fijos"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("production_volume.unit", data.value)
                }
                value={formik.values.production_volume.unit}
                error={formik.errors.production_volume?.unit? formik.errors.production_volume.unit : null}
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
                  formik.setFieldValue("production_volume.isApproved", data.value)
                }
                value={formik.values.production_volume.isApproved}
                error={formik.errors.production_volume?.isApproved? formik.errors.production_volume.isApproved : null}
              />
            </Table.Cell>
            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertProductionFieldsEngToEsp("production_volume"), "production_volume");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"production_volume"}/>
            </Table.Cell>
          </Table.Row>
                    
          <Table.Row>
          <Table.Cell>
              <label className="label">
                {formik.values.annual_average.code}{" "}
              </label>
            </Table.Cell>
            <Table.Cell>
              <label className="label">{convertProductionFieldsEngToEsp("annual_average")}</label>
            </Table.Cell>
            <Table.Cell>
                    <Form.Input
                type="number"
                name="annual_average.value"
                onChange={formik.handleChange}
                value={formik.values.annual_average.value}
                error={formik.errors.annual_average}
              />
            </Table.Cell>
            <Table.Cell>
            <Form.Dropdown
                //placeholder="Celda datos fijos"
                options={[{key:1, value:true,name:"dato"}].map((ds) => {
                  return {
                    key: ds.key,
                    text: ds.name,
                    value: ds.value,
                  };
                })}
                selection
                onChange={(_, data) =>
                  formik.setFieldValue("annual_average.unit", data.value)
                }
                value={formik.values.annual_average.unit}
                error={formik.errors.annual_average}
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
                  formik.setFieldValue("annual_average.isApproved", data.value)
                }
                value={formik.values.annual_average.isApproved}
                error={formik.errors.annual_average}
              />
              
            </Table.Cell>


            <Table.Cell>
              <Button
                icon
                type="button"
                primary
                onClick={() => {
                  openUpdateSite(convertProductionFieldsEngToEsp("annual_average"), "annual_average");
                }}
              >
                <Icon name="comment outline" />
              </Button>
              <FileUpload accessToken={accessToken} data={formik} field={"annual_average"}/>
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
          productionForm={productionForm}
          user={user}
        />
      </BasicModal>
      <Form.Group widths="2">
      {/* <Form.Button type="button"    secondary
          fluid onClick={handleAdd}>Añadir
        </Form.Button> */}
        <Form.Button type="submit" fluid primary loading={formik.isSubmitting}>
          {!productionForm ? "Guardar" : "Actualizar datos"}
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
        const response = await productionFormController.uploadFileApi(accessToken,formData);
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
      const response = await productionFormController.deleteFileApi(accessToken,fileName);
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
          const response = await productionFormController.getFileApi(fileName);
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
