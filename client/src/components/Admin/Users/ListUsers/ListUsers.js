import React, { useState, useEffect } from "react";
import { Loader, Search } from "semantic-ui-react";
import { size, map } from "lodash";
import { Permission, User } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { UserItem } from "../UserItem";
import { hasPermission, isAdmin } from "../../../../utils/checkPermission";
import { ErrorAccessDenied } from "../../../../pages/admin/Error";

const userController = new User();
const permissionController = new Permission();

export function ListUsers(props) {
  const { usersActive, reload, onReload } = props;
  const [users, setUsers] = useState(null);
  const {
    accessToken,
    user: { role },
  } = useAuth();

  const [permissionByRole, setPermissionsByRole] = useState([]);

  //   const [
  //     filterText,
  //     setFilterText
  // ] = useState("");
  // const [usersActiveFilter, setUsersActiveFilter] = useState([]);

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

  useEffect(() => {
    (async () => {
      try {
        setUsers(null);

        const response = await userController.getUsers(
          accessToken,
          usersActive
        );
        setUsers(response);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [usersActive, reload, accessToken]);

  if (!users) return <Loader active inline="centered" />;
  if (size(users) === 0) return "No hay ningun usuario";

  return (
    <div>
      {isAdmin(role) ||
      hasPermission(permissionByRole, role._id, "users", "view") ? (
        map(users, (user) => (
          <UserItem key={user._id} user={user} onReload={onReload} />
        ))
      ) : (
        <ErrorAccessDenied />
      )}
    </div>
  );
}
