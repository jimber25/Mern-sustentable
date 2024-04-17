import React, { useState, useEffect } from "react";
import {
  Button,
  Icon,
  Confirm,
  Grid,
  GridRow,
  GridColumn,
  Segment,
} from "semantic-ui-react";
import { Permission, Role } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { BasicModal } from "../../../Shared";
import { PermissionForm } from "../PermissionForm";
import {
  convertModulesEngToEsp,
  convertActionsEngToEsp,
} from "../../../../utils/converts";
import "./PermissionItem.scss";

const permissionController = new Permission();
const roleController = new Role();

export function PermissionItem(props) {
  const { permission, onReload } = props;
  const { accessToken } = useAuth();


  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [isDelete, setIsDelete] = useState(false);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateUser = () => {
    setTitleModal(`Actualizar ${permission.action}`);
    onOpenCloseModal();
  };

  const openDesactivateActivateConfim = () => {
    setIsDelete(false);
    setConfirmMessage(
      permission.active
        ? `Desactivar permiso ${permission.action}`
        : `Activar activar ${permission.action}`
    );
    onOpenCloseConfirm();
  };

  const onActivateDesactivate = async () => {
    try {
      await permissionController.updatePermission(accessToken, permission._id, {
        active: !permission.active,
      });
      onReload();
      onOpenCloseConfirm();
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteConfirm = () => {
    setIsDelete(true);
    setConfirmMessage(`Eliminar el permiso ${permission.action}`);
    onOpenCloseConfirm();
  };

  const onDelete = async () => {
    try {
      await permissionController.deletePermission(accessToken, permission._id);
      onReload();
      onOpenCloseConfirm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="permission-item">
        <div className="permission-item__info">
          <div>
            <Grid  columns={"equal"}>
              <GridRow stretched>
                {/* <GridColumn width={6}>
                  <p>{role}</p>
                </GridColumn> */}
                <GridColumn width={12}>
                  {convertModulesEngToEsp(permission.module)}
                </GridColumn>
                <GridColumn width={8}>
                  {convertActionsEngToEsp(permission.action)}
                </GridColumn>
              </GridRow>
            </Grid>
          </div>
        </div>
        <div>
          <Button icon primary onClick={openUpdateUser}>
            <Icon name="pencil" />
          </Button>
          <Button
            icon
            color={permission.active ? "orange" : "teal"}
            onClick={openDesactivateActivateConfim}
          >
            <Icon name={permission.active ? "ban" : "check"} />
          </Button>
          <Button icon color="red" onClick={openDeleteConfirm}>
            <Icon name="trash" />
          </Button>
        </div>
      </div>

      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <PermissionForm
          close={onOpenCloseModal}
          onReload={onReload}
          permission={permission}
        />
      </BasicModal>

      <Confirm
        open={showConfirm}
        onCancel={onOpenCloseConfirm}
        onConfirm={isDelete ? onDelete : onActivateDesactivate}
        content={confirmMessage}
        size="mini"
      />
    </>
  );
}
