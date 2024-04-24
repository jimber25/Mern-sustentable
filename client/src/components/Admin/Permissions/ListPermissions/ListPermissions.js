import React, { useState, useEffect } from "react";
import {
  Loader,
  Search,
  Grid,
  GridColumn,
  Divider,
  Header,
} from "semantic-ui-react";
import { size, map } from "lodash";
import { Permission, Role } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { PermissionItem } from "../PermissionItem";
import { RoleItem } from "../RoleItem";
import { hasPermission, isAdmin } from "../../../../utils/checkPermission";
import { ErrorAccessDenied } from "../../../../pages/admin/Error";
import { convertActionsEngToEsp, convertModulesEngToEsp } from "../../../../utils/converts";
const _ = require("lodash");

const permissionController = new Permission();
const roleController = new Role();

export function ListPermissions(props) {
  const { isByRoles, permissionsActive, reload, onReload } = props;
  const [permissions, setPermissions] = useState([]);

  // const [Role, setRole] = useState(null);
  const {
    user: { role },
    accessToken,
  } = useAuth();

  const [permissionsByRole, setPermissionsByRole] = useState([]);

  const [listRoles, setListRoles] = useState([]);

  const [listRolesFilter, setListRolesFilter] = useState([]);
  const [permissionsFilter, setPermissionsFilter] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setListRoles([]);
        setPermissions([]);
        if (isByRoles) {
          const response = await roleController.getRoles(accessToken, true);
          setListRoles(response);
          setListRolesFilter(response);
        } else {
          const response = await permissionController.getPermissions(
            accessToken
          );
          //
          setPermissions(response);
          setPermissionsFilter(response);
        }
      } catch (error) {
        console.error(error);
        setListRoles([]);
        setPermissions([]);
        setPermissionsFilter([]);
        setListRolesFilter([]);
      }
    })();
  }, [isByRoles, permissionsActive, reload]);

  useEffect(() => {
    (async () => {
      try {
        setPermissionsByRole([]);
        if (role) {
          const response = await permissionController.getPermissionsByRole(
            accessToken,
            role._id,
            true
          );
          setPermissionsByRole(response);
        }
      } catch (error) {
        console.error(error);
        setPermissionsByRole([]);
      }
    })();
  }, [role]);

  if (
    isByRoles &&
    (isAdmin(role) ||
      hasPermission(permissionsByRole, role._id, "permissions", "view"))
  ) {
    if (!listRoles) return <Loader active inline="centered" />;
    if (size(listRoles) === 0) return "No hay ningun rol";
    return (
      <div>
        <div>
          <SearchStandardRole
            dataOrigin={listRoles}
            data={listRolesFilter}
            setData={setListRolesFilter}
          />
        </div>
        <Divider clearing/>
        <div>
          {map(listRolesFilter, (role) => (
            <RoleItem key={role._id} role={role} onReload={onReload} />
          ))}
        </div>
      </div>
    );
  } else if (
    !isByRoles &&
    (isAdmin(role) ||
      hasPermission(permissionsByRole, role._id, "permissions", "view"))
  ) {
    if (!permissions) return <Loader active inline="centered" />;
    if (size(permissions) === 0) return "No hay ningun permiso";
    return (
      <div>
        <div>
          <SearchStandardPermission
            dataOrigin={permissions}
            data={permissionsFilter}
            setData={setPermissionsFilter}
          />
        </div>
        <Divider clearing/>
        <div>
          {map(permissionsFilter, (permission) => (
            <PermissionItem
              key={permission._id}
              permission={permission}
              onReload={onReload}
            />
          ))}
        </div>
      </div>
    );
  } else {
    return <ErrorAccessDenied />;
  }
}

function SearchStandardRole(props) {
  const { dataOrigin, data, setData } = props;
  const [state, setState] = useState({
    isLoading: false,
    results: [],
    value: "",
  });

  const handleResultSelect = (e, { result }) =>
    setState({ value: result.name });

  const handleSearchChange = (e, { value }) => {
    setState({ isLoading: true, value });

    setTimeout(() => {
      if (value && value.length < 1) {
        setState({ isLoading: false, results: [], value: "" });
        setData(dataOrigin);
        return true;
      } else if (value.length === 0) {
        setData(dataOrigin);
        setState({ isLoading: false, results: [], value: "" });
        return true;
      }
      const re = new RegExp(_.escapeRegExp(value), "i");
      const isMatch = (result) => re.test(result.name);
      setState({
        isLoading: false,
        results: _.filter(data, isMatch),
      });
      setData(_.filter(data, isMatch));
    }, 300);
  };

  const resultRenderer = (data) => {
    return (
      <div>
        <p>{data.name}</p>
      </div>
    );
  };

  return (
    <Grid>
      <GridColumn width={6}>
        <Search
          fluid
          input={{ icon: "search", iconPosition: "left" }}
          loading={state.isLoading}
          onResultSelect={handleResultSelect}
          onSearchChange={_.debounce(handleSearchChange, 500, {
            leading: true,
          })}
          results={state.results}
          value={state.value}
          resultRenderer={resultRenderer}
          size={"large"}
        />
      </GridColumn>
    </Grid>
  );
}

function SearchStandardPermission(props) {
  const { dataOrigin, data, setData } = props;
  const [state, setState] = useState({
    isLoading: false,
    results: [],
    value: "",
  });

  const handleResultSelect = (e, { result }) =>{
    setState({  value: result.role.name })
    setData([result]);}

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

  const resultRenderer = (data) => {
    return (
      <div>
        <p>{data.role.name}</p> {convertModulesEngToEsp(data.module)} {"|"} {convertActionsEngToEsp(data.action)}
      </div>
    );
  };

  return (
    <Grid>
      <GridColumn width={6}>
        <Search
          fluid
          input={{ icon: "search", iconPosition: "left" }}
          loading={state.isLoading}
          onResultSelect={handleResultSelect}
          onSearchChange={_.debounce(handleSearchChange, 500, {
            leading: true,
          })}
          results={state.results}
          value={state.value}
          resultRenderer={resultRenderer}
          size={"large"}
        />
      </GridColumn>
    </Grid>
  );
}
