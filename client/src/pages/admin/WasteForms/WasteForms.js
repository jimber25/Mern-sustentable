import React, { useState, useEffect } from "react";
import { Tab, Button, Table, Divider, Icon , Dropdown, Segment, Header} from "semantic-ui-react";
import { BasicModal } from "../../../components/Shared";
import {
  ListWasteForms,
  WasteForm,
} from "../../../components/Admin/WasteForms";
import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks";
import { Site } from "../../../api";
import { encrypt, decrypt } from "../../../utils/cryptoUtils";
import { useLocation } from "react-router-dom";
import {
  hasPermission,
  isAdmin,
  isMaster,
} from "../../../utils/checkPermission";
import "./WasteForms.scss";

const siteController = new Site();

export function WasteForms() {
  const [showModal, setShowModal] = useState(false);
  const [reload, setReload] = useState(false);
  const {
    accessToken,
    user: { role, site },
  } = useAuth();
  const [sitesFilter, setSitesFilter] = useState([]);
  const [siteSelected, setSiteSelected] = useState(null);
  const [yearSelected, setYearSelected] = useState(new Date().getFullYear());

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onReload = () => setReload((prevState) => !prevState);

  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        if (!site && !location.state?.siteSelected) {
          const response = await siteController.getSites(accessToken);
          setSitesFilter(response);
        }
      } catch (error) {
        console.error(error);
        setSitesFilter([]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (location.state?.siteSelected) {
          setSiteSelected(decrypt(location.state.siteSelected));
        }
      } catch (error) {
        console.error(error);
      }
    })();
  }, [location]);

  const handleSelected = (idSite) => {
    setSiteSelected(idSite._id);
  };

  const panes = [
    {
      render: () => (
        <Tab.Pane attached={false}>
          {siteSelected === null &&
          (isMaster(role) || (isAdmin(role) && !site)) ? (
            <SelectedListSites
              sitesFilter={sitesFilter}
              handleSelected={handleSelected}
            />
          ) : !site && siteSelected !== null ? (
            <ListWasteForms
              reload={reload}
              onReload={onReload}
              siteSelected={siteSelected}
              yearSelected={yearSelected}
            />
          ) : (
            <ListWasteForms 
            siteSelected={siteSelected}
            yearSelected={yearSelected}
            reload={reload} 
            onReload={onReload} />
          )}
        </Tab.Pane>
      ),
    },
  ];

   // Generar una lista de años (por ejemplo, del 2000 al 2024)
   const currentYear = new Date().getFullYear();
   const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <>
      <div className="waste-forms-page">
      <Segment textAlign="center">
          {" "}
          <Header as="h1">RESIDUOS</Header>
        </Segment>
        <div className="waste-forms-page__add">
          {siteSelected !== null || site ? (
            //      <Link to={"/admin/wasteforms/newwasteform"} state= {{siteSelected: encrypt(siteSelected) }}
            // >
            <Button primary onClick={onOpenCloseModal}>
              <Icon name="plus" /> Nuevo Formulario Residuos
            </Button>
          ) : // </Link>
          null}
        </div>
        <>
        {siteSelected !== null || site ? (
          <Dropdown
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
            onChange={(_, data) => setYearSelected(data.value)}
            value={yearSelected}
          />) : null}
        </>
        <Tab menu={{ secondary: true }} panes={panes} />
      </div>

      <BasicModal
        show={showModal}
        close={onOpenCloseModal}
        title="Formulario Residuos"
        size={"fullscreen"}
      >
        <WasteForm onClose={onOpenCloseModal} onReload={onReload} year={yearSelected}
          siteSelected={siteSelected}/>
      </BasicModal>
    </>
  );
}

function SelectedListSites(props) {
  const { sitesFilter, role, permissionByRole, handleSelected } = props;

  return (
    <div>
      {/* { isMaster(role) || isAdmin(role) ||
      hasPermission(permissionByRole, role._id, "sites", "view") ? ( */}
      <div>
        <div>
          {/* <SearchStandardSite
              dataOrigin={sites}
              data={sitesFilter}
              setData={setSitesFilter}
            /> */}
        </div>
        <Divider clearing />

        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Razon Social</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Acciones</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {sitesFilter.map((site) => (
              <Table.Row key={site._id}>
                <Table.Cell>{site.name ? site.name : ""}</Table.Cell>
                <Table.Cell>{site.email}</Table.Cell>
                <Table.Cell>
                  {
                    // isMaster(role) || isAdmin(role) ||
                    // hasPermission(permissionsByRole, role._id, "sites", "edit") ? (
                    <Button
                      icon
                      primary
                      onClick={() => {
                        handleSelected(site);
                      }}
                    >
           <Icon name="angle double right" />
                    </Button>
                    // ) : null
                  }
                  {/* {isMaster(role) || isAdmin(role) ||
                    hasPermission(permissionsByRole, role._id, "sites", "edit") ? (
                      <Button
                        icon
                        color={site.active ? "orange" : "teal"}
                        onClick={openDesactivateActivateConfim}
                      >
                        <Icon name={site.active ? "ban" : "check"} />
                      </Button>
                    ) : null} */}
                  {/* {isMaster(role) || isAdmin(role) ||
                    hasPermission(permissionsByRole, role._id, "sites", "delete") ? (
                      <Button icon color="red" onClick={openDeleteConfirm}>
                        <Icon name="trash" />
                      </Button>
                    ) : null} */}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      {/* ) : (
        // <ErrorAccessDenied />
        <></>
      )} */}
    </div>
  );
}
