import React, { useState, useEffect } from "react";
import {
  Loader,
  Table,
  Divider,
  Dropdown,
  Confirm,
  Label,
} from "semantic-ui-react";
import { size, map } from "lodash";
import { KPIsform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import {
  hasPermission,
  isAdmin,
  isMaster,
} from "../../../../utils/checkPermission";
import "./ListKPIsForms.scss";
import { KPIsForm } from "../KPIsForm";
import { BasicModal } from "../../../Shared";
import { PERIODS } from "../../../../utils";
import { kpisCodes } from "../../../../utils/codes";
import {
  convertKPIsFieldsEngToEsp,
  convertPeriodsEngToEsp,
} from "../../../../utils/converts";
import { formatDateView } from "../../../../utils/formatDate";
const _ = require("lodash");

const kpisFormController = new KPIsform();

export function ListKPIsForms(props) {
  const { reload, onReload, siteSelected, yearSelected } = props;
  const [kpisForms, setKPIsForms] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState();
  // const [Role, setRole] = useState(null);
  console.log("aca");
  const {
    user: { role, site },
    accessToken,
  } = useAuth();

  useEffect(() => {
    (async () => {
      if (yearSelected !== "" && siteSelected !== undefined)
        try {
          const response = await kpisFormController.getKPIsFormsBySiteAndYear(
            accessToken,
            siteSelected,
            yearSelected
          );
          if (response.code === 200) {
            setKPIsForms(response.kpisForms);
          } else {
            setKPIsForms([]);
          }
        } catch (error) {
          console.error(error);
        }
    })();
  }, [yearSelected, siteSelected, reload]);

  if (!kpisForms) return <Loader active inline="centered" />;
  //if (size(kpisForms) === 0) return "No hay ningun formulario de efluentes";
  //  if (size(kpisForms) === 0) return <TablePeriods data2={kpisForms}/>;

  return (
    <div className="list-kpis-forms">
      <TablePeriods
        data={kpisForms}
        onReload={onReload}
        accessToken={accessToken}
        year={yearSelected}
        site={siteSelected}
      />
    </div>
  );
}

function TablePeriods(props) {
  const { data, onReload, accessToken, year, site } = props;

  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [modalContent, setModalContent] = useState("");
  const [confirmContent, setConfirmContent] = useState("");
  const [dataDeleted, setDataDelete] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = (e) => setDataDelete(e);

  console.log("kkkkk");
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
      `Eliminar el formulario de KPIs con fecha ${formatDateView(form.date)}`
    );
    setDataDelete(form);
    onOpenCloseConfirm();
  };

  const openUpdateKPIsForm = (period) => {
    //setFieldName(name);
    const form = data.find((item) => item.period === period);
    setTitleModal(
      `Actualizar formulario efluente: ${convertPeriodsEngToEsp(form.period)}-${
        form.year
      }`
    );
    setModalContent(
      <KPIsForm
        onClose={onOpenCloseModal}
        onReload={onReload}
        kpisForm={form}
      />
    );
    setShowModal(true);
  };

  const openNewKPIsForm = (period) => {
    setTitleModal(`Nuevo formulario KPIs`);
    setModalContent(
      <KPIsForm
        onClose={onOpenCloseModal}
        onReload={onReload}
        period={period}
        year={year}
        siteSelected={site}
      />
    );
    setShowModal(true);
  };

  const onDelete = async () => {
    try {
      //TODO: modificar por controlador correspondiente
      await kpisFormController.deleteKPIsForm(accessToken, dataDeleted._id);
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

    Object.keys(kpisCodes).forEach((key) => {
      fields.add(key);
    });

    return Array.from(fields);
  };

  const determineMainFields = () => {
    const fields = ["energy_indicators", "greenhouse_gas_indicators"];

    return fields;
  };

  const fieldsFinal = () => {
    const field = {
      energy_indicators: [
        "total_fuel_energy_consumption",
        "total_electrical_energy_consumption",
        "total_energy_consumption",
        "total_renewable_energy",
        "percentage_of_renewable_energy",
        "% de energías renovables",
        "percentage_energy_from_fossil_fuels",
        "total_energy_consumed_per_productive_unit",
        "total_cost_of_energy_consumed",
      ],
      greenhouse_gas_indicators: [
        "total_scope_1",
        "total_scope_2",
        "total_scope_3",
        "total_emissions_per_unit_produced",
        "total_emissions",
        "scope_percentage_1",
        "scope_percentage_2",
        "scope_percentage_3",
      ],
    };
    return field;
  };

  // Retorna el código
  const hasCode = (field) => {
    return kpisCodes[field];
  };

  const hasDataPeriod = (period) => {
    const existsPeriod = data.some((entry) => entry.period === period);
    return existsPeriod;
  };

  console.log(hasDataPeriod("April"));

  // Obtener todos los campos únicos
  const uniqueFields = fieldsFinal();
  // Obtener todos los campos únicos
  const mainFields = ["energy_indicators", "greenhouse_gas_indicators"];

  const calculateTotalAndAverage = (mainField, field) => {
    const values = data.map((item) => item[mainField][field]?.value || 0);
    const total = values.reduce((acc, val) => acc + val, 0);
    const average = values.length ? total / values.length : 0;
    return { total, average };
  };

  return (
    <>
      <Table celled structured>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell rowSpan="2" textAlign="center">
              Codigo
            </Table.HeaderCell>
            <Table.HeaderCell rowSpan="2" textAlign="center">
              Item
            </Table.HeaderCell>
            <Table.HeaderCell rowSpan="2" textAlign="center">
              Unidades
            </Table.HeaderCell>
            <Table.HeaderCell colSpan="14" textAlign="center">
              PERIODO DE REPORTE {year}
            </Table.HeaderCell>
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
                          onClick={() => openUpdateKPIsForm(period)}
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
                          onClick={() => openNewKPIsForm(period)}
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
          {mainFields.map((f) => (
            <>
              <React.Fragment key={f}>
                <Table.Row>
                  <Table.Cell collapsing width={18}>
                    {" "}
                    <Label ribbon>{convertKPIsFieldsEngToEsp(f)}</Label>
                  </Table.Cell>
                </Table.Row>
              </React.Fragment>
              <SubFields
                f={f}
                listFields={uniqueFields}
                data={data}
                calculateTotalAndAverage={calculateTotalAndAverage}
                periods={periods}
              />
            </>
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

function SubFields(props) {
  const { f, listFields, periods, data, calculateTotalAndAverage } = props;

  return listFields[f].map((field) => {
    return (
      <React.Fragment key={field}>
        <Table.Row>
          <Table.Cell>{kpisCodes[field]}</Table.Cell>
          <Table.Cell>{convertKPIsFieldsEngToEsp(field)}</Table.Cell>
          <Table.Cell>{"-"}</Table.Cell>
          {periods.map((period) => {
            const item = data.find((d) => d.period === period);
            return (
              <Table.Cell key={`${field}-${period}`}>
                {item && item[f][field] ? item[f][field].value : "-"}
              </Table.Cell>
            );
          })}
          <Table.Cell>{calculateTotalAndAverage(f, field).total}</Table.Cell>
          <Table.Cell>
            {calculateTotalAndAverage(f, field).average.toFixed(2)}
          </Table.Cell>
        </Table.Row>
      </React.Fragment>
    );
  });
}
