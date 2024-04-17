import React, { useState, useEffect } from "react";
import { Loader, Search } from "semantic-ui-react";
import { size, map } from "lodash";
import { Permission, Role } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { PermissionItem } from "../PermissionItem";
import { RoleItem } from "../RoleItem";

const permissionController = new Permission();
const roleController = new Role();

export function ListPermissions(props) {
  const { isByRoles, permissionsActive, reload, onReload } = props;
  const [permissions, setPermissions] = useState([]);
  // const [Role, setRole] = useState(null);

  //Listo los roles
  const [listRoles, setListRoles] = useState([]);

  const { accessToken } = useAuth();
  //   const [
  //     filterText,
  //     setFilterText
  // ] = useState("");
  // const [usersActiveFilter, setUsersActiveFilter] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setListRoles([]);
        setPermissions([]);
        if (isByRoles) {
          // const response = await permissionController.getPermissions(
          //   accessToken,
          //   permissionsActive
          // );
          const response = await roleController.getRoles(accessToken, true);
          setListRoles(response);
        } else {
          const response = await permissionController.getPermissions(
            accessToken
          );
          setPermissions(response);
        }
      } catch (error) {
        console.error(error);
        setListRoles([]);
        setPermissions([]);
      }
    })();
  }, [isByRoles, permissionsActive, reload]);


  if (isByRoles) {
    if (!listRoles) return <Loader active inline="centered" />;
    if (size(listRoles) === 0) return "No hay ningun rol";
    return (
      <div>
        {map(listRoles, (role) => (
          <RoleItem key={role._id} role={role} onReload={onReload} />
        ))}
      </div>
    );
  } else {
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
  }
}
