import React, { useState } from "react";
import { Tab, Button } from "semantic-ui-react";
import { BasicModal } from "../../../components/Shared";
import { RoleForm, ListRoles } from "../../../components/Admin/Roles";
import "./Roles.scss";

export function Roles() {
  const [showModal, setShowModal] = useState(false);
  const [reload, setReload] = useState(false);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onReload = () => setReload((prevState) => !prevState);

  const panes = [
    {
      menuItem: "Roles activos",
      render: () => (
        <Tab.Pane attached={false}>
          <ListRoles rolesActive={true} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Roles inactivos",
      render: () => (
        <Tab.Pane attached={false}>
          <ListRoles rolesActive={false} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <div className="roles-page">
        <Button className="roles-page__add" primary onClick={onOpenCloseModal}>
          Nuevo rol
        </Button>
        <Tab menu={{ secondary: true }} panes={panes} />
      </div>

      <BasicModal
        show={showModal}
        close={onOpenCloseModal}
        title="Crear nuevo rol"
      >
        <RoleForm close={onOpenCloseModal} onReload={onReload} />
      </BasicModal>
    </>
  );
}