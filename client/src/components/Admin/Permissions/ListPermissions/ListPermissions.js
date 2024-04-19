import React, { useState, useEffect } from "react";
import { Loader, Search } from "semantic-ui-react";
import { size, map } from "lodash";
import { Permission, Role } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { PermissionItem } from "../PermissionItem";
import { RoleItem } from "../RoleItem";
import { hasPermission, isAdmin } from "../../../../utils/checkPermission";
import { ErrorAccessDenied } from "../../../../pages/admin/Error";

const permissionController = new Permission();
const roleController = new Role();

export function ListPermissions(props) {
  const { isByRoles, permissionsActive, reload, onReload } = props;
  const [permissions, setPermissions] = useState([]);
  // const [Role, setRole] = useState(null);
  const {
    user: { role },
    accessToken
  } = useAuth();

  const [permissionsByRole, setPermissionsByRole]=useState([]);

  const [listRoles, setListRoles] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setListRoles([]);
        setPermissions([]);
        if (isByRoles) {
          const response = await roleController.getRoles(accessToken, true);
          setListRoles(response);
        } else {
          const response = await permissionController.getPermissions(
            accessToken
          );
          //
          setPermissions(response);
        }
      } catch (error) {
        console.error(error);
        setListRoles([]);
        setPermissions([]);
      }
    })();
  }, [isByRoles, permissionsActive, reload]);

  useEffect(() => {
    (async () => {
      try {
        setPermissionsByRole([]);
        if (role) {
          // const response = await permissionController.getPermissions(
          //   accessToken,
          //   permissionsActive
          // );
          const response = await permissionController.getPermissionsByRole(accessToken, role._id, true);
          setPermissionsByRole(response);
        }
      } catch (error) {
        console.error(error);
        setPermissionsByRole([]);
      }
    })();
  }, [role]);

  if (isByRoles && (isAdmin(role) || hasPermission(permissionsByRole, role._id, "permissions", "view"))) {
      if (!listRoles) return <Loader active inline="centered" />;
      if (size(listRoles) === 0) return "No hay ningun rol";
      return (
        <div>
          {map(listRoles, (role) => (
            <RoleItem key={role._id} role={role} onReload={onReload} />
          ))}
        </div>
      );
    } 
    else if(!isByRoles && (isAdmin(role) || hasPermission(permissionsByRole, role._id, "permissions", "view"))) {
      if (!permissions) return <Loader active inline="centered" />;
      if (size(permissions) === 0) return "No hay ningun permiso";
      return (
        <div>
          {map(permissions, (permission) => (
            <PermissionItem
              key={permission._id}
              permission={permission}
              onReload={onReload}
            />
          ))}
        </div>
      );
    }else{
      return <ErrorAccessDenied/>;
    }


}
