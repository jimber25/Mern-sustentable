import React, { useState , useEffect} from "react";
import { Tab, Button , Icon } from "semantic-ui-react";
import { BasicModal } from "../../../components/Shared";
import { PermissionForm, ListPermissions } from "../../../components/Admin/Permissions";
import { useAuth } from "../../../hooks";
import { Permission } from "../../../api";
import { hasPermission , isAdmin, isMaster} from "../../../utils/checkPermission";
import { ErrorAccessDenied } from "../../../pages/admin/Error";
import "./Permissions.scss";
import { useLanguage } from "../../../contexts";

const permissionController = new Permission();

export function Permissions() {
  const [showModal, setShowModal] = useState(false);
  const [reload, setReload] = useState(false);
  const {
    user: { role },
    accessToken
  } = useAuth();

  const { language, changeLanguage, translations } = useLanguage();
  
  const t = (key) => translations[key] || key ; // Función para obtener la traducción

  const [permissionsByRole, setPermissionsByRole]=useState([]);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onReload = () => setReload((prevState) => !prevState);

  useEffect(() => {
    (async () => {
      try {
        setPermissionsByRole([]);
        if (role) {
          const response = await permissionController.getPermissionsByRole(accessToken, role._id, true);
          setPermissionsByRole(response);
        }
      } catch (error) {
        console.error(error);
        setPermissionsByRole([]);
      }
    })();
  }, [role]);

  const panes = [
    {
      menuItem: t("by_roles"),
      render: () => (
        <Tab.Pane attached={false}>
          <ListPermissions isByRoles={true} permissionsActive={true} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("by_permissions"),
      render: () => (
        <Tab.Pane attached={false}>
          <ListPermissions isByRoles={false} permissionsActive={false} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
    { isMaster(role) || isAdmin(role) || hasPermission(permissionsByRole, role._id, "permissions", "view")?
    (<>
    <div className="permissions-page">
      {isMaster(role) || isAdmin(role) || hasPermission(permissionsByRole, role._id, "permissions", "create")?
        <Button className="permissions-page__add" primary onClick={onOpenCloseModal}>
         <Icon name='plus' />  { t("new_permission")}
        </Button>: null}
        <Tab menu={{ secondary: true }} panes={panes} /> 
      </div>
      <BasicModal
        show={showModal}
        close={onOpenCloseModal}
        title={t("create_permission")}
      >
        <PermissionForm close={onOpenCloseModal} onReload={onReload} />
      </BasicModal></>) : 
      <ErrorAccessDenied/>}
    </>
  )
}

