import React, { useState, useEffect } from "react";
import { Loader, Pagination, Table, Grid, GridColumn, Input, Divider, Dropdown, Confirm } from "semantic-ui-react";
import { size, map } from "lodash";
import { Siteform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { SiteFormItem } from "../SiteFormItem";
import {
  hasPermission,
  isAdmin,
  isMaster,
} from "../../../../utils/checkPermission";
import "./ListSiteForms.scss";
import { formatDateView } from "../../../../utils/formatDate";
import { convertPeriodsEngToEsp, convertSiteFieldsEngToEsp } from "../../../../utils/converts";
import { SiteForm } from "../SiteForm";
import { PERIODS } from "../../../../utils";
import { BasicModal } from "../../../Shared";
import { siteCodes } from "../../../../utils/codes";
const _ = require("lodash");


const siteFormController = new Siteform();

export function ListSiteForms(props) {
  const { reload, onReload , siteSelected, yearSelected} = props;
  console.log(siteSelected)
  const [siteforms, setSiteForms] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState();
    // const [Role, setRole] = useState(null);
    const {
      user: { role, site },
      accessToken,
    } = useAuth();
  

 
    useEffect(() => {
      (async () => {
        if(yearSelected!=="" && siteSelected!==undefined)
        try {
          const response = await siteFormController.getSiteFormsBySiteAndYear(
            accessToken,
            siteSelected,
            yearSelected
          );
          console.log(response, "por año y sitio")
          if (response.code ===200 && response.siteForms) {
            setSiteForms(response.siteForms);
          } else {
            setSiteForms([]);
          }
  
        } catch (error) {
          console.error(error);
          setSiteForms([]);
        }
      })();
    }, [yearSelected,siteSelected, reload]);

  const changePage = (_, data) => {
    setPage(data.activePage);
  };

  if (!siteforms) return <Loader active inline="centered" />;
  //if (size(siteforms) === 0) return "No hay ningun formulario de sitio";

  return (
    <div className="list-sites">
      {/* {map(siteforms, (siteForm) => (
        <SiteFormItem key={siteForm._id} siteForm={siteForm} onReload={onReload} />
      ))} */}

<TablePeriods
        data={siteforms}
        onReload={onReload}
        accessToken={accessToken}
        year={yearSelected}
        site={siteSelected}
      />

      <div className="list-sites__pagination">
          {/* <SearchStandardPermission
            dataOrigin={siteforms}
            // data={permissionsFilter}
            // setData={setPermissionsFilter}
          /> */}
        </div>
        <Divider clearing/>

      {/* <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Estado</Table.HeaderCell>
                <Table.HeaderCell >Fecha</Table.HeaderCell>
                <Table.HeaderCell>Usuario Creador</Table.HeaderCell>
                <Table.HeaderCell>Acciones</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
            {map(siteforms, (siteForm) => (
        <SiteFormItem key={siteForm._id} siteForm={siteForm} onReload={onReload} />
      ))}
           </Table.Body>
           </Table> */}
        {/* <Pagination
          totalPages={pagination.pages}
          defaultActivePage={pagination.page}
          ellipsisItem={null}
          firstItem={null}
          lastItem={null}--
          onPageChange={changePage}
        /> */}
        {/* <Pagination
        activePage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={changePage}
      /> */}
      </div>
  );
}


function SearchStandardPermission(props) {
  const { dataOrigin, data, setData } = props;
  const [state, setState] = useState({
    isLoading: false,
    results: [],
    value: "",
  });

  const handleSearchChange = (e, { value }) => {
    setState({ isLoading: true, value });

    setTimeout(() => {
      if (value && value.length < 1) {
        setState({ isLoading: false, results: [], value: "" })
        setData(dataOrigin);
        return true;
      } else if (value.length === 0) {
        setData(dataOrigin);
        setState({ isLoading: false, results: [], value: "" });
        return true;
      }
      const re = new RegExp(_.escapeRegExp(value), "i");
      const isMatch = (result) => re.test(result.role.name);
      setState({
        isLoading: false,
        results: _.filter(data, isMatch),
      });
      setData(_.filter(data, isMatch));
    }, 300);
  };


  return (
    <Grid>
      <GridColumn width={6}>
      <Input
       icon='search'
       iconPosition='left'
      placeholder='Buscar...'
    onChange={_.debounce(handleSearchChange, 500, {
      leading: true,
    })}
        />
      </GridColumn>
    </Grid>
  );
}


function TablePeriods(props) {

  const { data, onReload, accessToken , year, site} = props;

  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [confirmContent, setConfirmContent] = useState("");
  const [dataDeleted, setDataDelete] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = (e) => setDataDelete(e)


  // Estado para controlar el modal
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  // Función para abrir el modal con datos del período seleccionado
  const handleOpenModal = (period) => {
    setSelectedPeriod(data.find((item) => item.period === period));
    //setModalOpen(true);
    onOpenCloseModal();
  };

  // Función para cerrar el modal
  const handleDeleteModal = (period) => {
    const form = data.find((item) => item.period === period);
    setConfirmContent(
      `Eliminar el formulario de efluentes con fecha ${formatDateView(
        form.date
      )}`
    );
    setDataDelete(form)
    onOpenCloseConfirm();
  };

  const openUpdateEffluentForm = (period) => {
    //setFieldName(name);
    const form = data.find((item) => item.period === period);
    setTitleModal(
      `Actualizar formulario efluente: ${convertPeriodsEngToEsp(form.period)}-${
        form.year
      }`
    );
    setModalContent(
      <SiteForm
        onClose={onOpenCloseModal}
        onReload={onReload}
        waterForm={form}
      />
    );
    setShowModal(true);
  };

  const openNewEffluentForm = (period) => {
    setTitleModal(`Nuevo formulario efluente`);
    setModalContent(
      <SiteForm onClose={onOpenCloseModal} onReload={onReload} period={period} year={year} siteSelected={site}/>
    );
    setShowModal(true);
  };

  const onDelete = async () => {
    try {
      //TODO: modificar por controlador correspondiente
      await siteFormController.deleteSiteForm(accessToken, dataDeleted._id);
      setDataDelete("");
      onReload();
      onOpenCloseConfirm();
    } catch (error) {
      console.error(error);
    }
  };

  // Obtén los nombres de los períodos para las columnas
  const periods = PERIODS;

  // Determinar los campos únicos y si tienen código
  const determineFields = () => {
    const fields = new Set();

    Object.keys(siteCodes).forEach((key) => {
      fields.add(key);
    });

    return Array.from(fields);
  };

  // Retorna el código
  const hasCode = (field) => {
    return siteCodes[field];
  };

  const hasDataPeriod = (period) => {
    const existsPeriod = data.some((entry) => entry.period === period);
    return existsPeriod;
  };

  console.log(hasDataPeriod("April"));

  // Obtener todos los campos únicos
  const uniqueFields = determineFields();

  const calculateTotalAndAverage = (field) => {
    const values = data.map((item) => item[field]?.value || 0);
    const total = values.reduce((acc, val) => acc + val, 0);
    const average = values.length ? total / values.length : 0;
    return { total, average };
  };

  return (
    <>
      <Table celled structured>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan='2'  textAlign="center">Codigo</Table.HeaderCell>
            <Table.HeaderCell rowSpan='2'  textAlign="center">Item</Table.HeaderCell>
            <Table.HeaderCell rowSpan='2'  textAlign="center">Unidades</Table.HeaderCell>
            <Table.HeaderCell colSpan='14' textAlign="center">PERIODO DE REPORTE {year}</Table.HeaderCell>
      </Table.Row>
      <Table.Row>
            {periods.map((period, index) => (
              <Table.HeaderCell key={index}>

                {convertPeriodsEngToEsp(period)}
                {hasDataPeriod(period) ? (
                  <>
                    <Dropdown
                      inline
                      size="tiny"
                      icon="ellipsis vertical"
                      floating
                      className="icon"
    
                    >
                      <Dropdown.Menu>
                        <Dropdown.Item
                          text="Editar"
                          icon="edit"
                          onClick={() => openUpdateEffluentForm(period)}
                        />
                        <Dropdown.Item
                          text="Eliminar"
                          icon="trash"
                          onClick={() => handleDeleteModal(period)}
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                ) : (
                  <>
                    <Dropdown
                      link
                      icon="ellipsis vertical"
                      floating
                      size="tiny"
                      className="icon"
                      // style={{ marginLeft: "10px" }}
                    >
                      <Dropdown.Menu>
                        <Dropdown.Item
                          text="Cargar datos"
                          icon="plus"
                          onClick={() => openNewEffluentForm(period)}
                        />
                      </Dropdown.Menu>
                    </Dropdown>
                  </>
                )}
              </Table.HeaderCell>
            ))}
            <Table.HeaderCell>Total</Table.HeaderCell>
            <Table.HeaderCell>Promedio</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {uniqueFields.map((field) => (
            <React.Fragment key={field}>
              <Table.Row>
                <Table.Cell>{siteCodes[field]}</Table.Cell>
                <Table.Cell>{convertSiteFieldsEngToEsp(field)}</Table.Cell>
                <Table.Cell>{"-"}</Table.Cell>
                {periods.map((period) => {
                  const item = data.find((d) => d.period === period);
                  return (
                    <Table.Cell key={`${field}-${period}`}>
                      {item && item[field] ? item[field].value : "-"}
                    </Table.Cell>
                  );
                })}
                <Table.Cell>{calculateTotalAndAverage(field).total}</Table.Cell>
                <Table.Cell>
                  {calculateTotalAndAverage(field).average.toFixed(2)}
                </Table.Cell>
              </Table.Row>
            </React.Fragment>
          ))}
        </Table.Body>

        {/* <Table.Body>
      <Table.Row>
      <Table.Cell>      {codes.electricityCode}</Table.Cell>
        <Table.Cell>Electricidad</Table.Cell>
        {electricityValues.map((value, index) => (
          <Table.Cell key={index}>{value}</Table.Cell>
        ))}
                <Table.Cell>{totalElectricity}</Table.Cell>
                <Table.Cell>{averageElectricity.toFixed(2)}</Table.Cell>
      </Table.Row>
      <Table.Row>
      <Table.Cell>      {codes.waterCode}</Table.Cell>
        <Table.Cell>Agua</Table.Cell>
        {waterValues.map((value, index) => (
          <Table.Cell key={index}>{value}</Table.Cell>
        ))}
          <Table.Cell>{totalWater}</Table.Cell>
          <Table.Cell>{averageWater.toFixed(2)}</Table.Cell>
      </Table.Row>
    </Table.Body> */}
      </Table>
      {/* Modal para mostrar detalles del período seleccionado */}
      {showModal ? (
        <>
          <BasicModal
            show={showModal}
            close={onOpenCloseModal}
            title={titleModal}
            size={"fullscreen"}
          >
            {modalContent}
          </BasicModal>
        </>
      ) : null}
      <Confirm
        open={showConfirm}
        onCancel={onOpenCloseConfirm}
        onConfirm={onDelete}
        content={confirmContent}
        size="tiny"
        cancelButton="Cancelar"
        confirmButton="Aceptar"
      />
    </>
  );
}