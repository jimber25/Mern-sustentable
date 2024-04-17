import React, { useState } from "react";
import { Tab, Button } from "semantic-ui-react";
import { BasicModal } from "../../../components/Shared";
import { PermissionForm, ListPermissions } from "../../../components/Admin/Permissions";
import "./Permissions.scss";

export function Permissions() {
  const [showModal, setShowModal] = useState(false);
  const [reload, setReload] = useState(false);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onReload = () => setReload((prevState) => !prevState);

  const panes = [
    {
      menuItem: "Por Roles",
      render: () => (
        <Tab.Pane attached={false}>
          <ListPermissions isByRoles={true} permissionsActive={true} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: "Por Permisos",
      render: () => (
        <Tab.Pane attached={false}>
          <ListPermissions isByRoles={false} permissionsActive={false} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <div className="permissions-page">
        <Button className="permissions-page__add" primary onClick={onOpenCloseModal}>
          Nuevo permiso
        </Button>
        <Tab menu={{ secondary: true }} panes={panes} /> 
        
      </div>

      <BasicModal
        show={showModal}
        close={onOpenCloseModal}
        title="Crear nuevo permiso"
      >
        <PermissionForm close={onOpenCloseModal} onReload={onReload} />
      </BasicModal>
    </>
  );
}