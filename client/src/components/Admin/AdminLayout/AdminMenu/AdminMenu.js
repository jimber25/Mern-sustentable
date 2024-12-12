import React, { useEffect, useState } from "react";
import {
  Menu,
  Icon,
  DropdownMenu,
  Dropdown,
  DropdownItem,
  DropdownHeader,
} from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import { Permission } from "../../../../api";
import { useAuth } from "../../../../hooks";
import "./AdminMenu.scss";
import { hasPermission, isAdmin, isMaster } from "../../../../utils/checkPermission";
import { useLanguage } from "../../../../contexts";

const permissionController = new Permission();

export function AdminMenu() {
  const { pathname } = useLocation();
  const {
    user: { role },
    accessToken,
  } = useAuth();

  const { language, changeLanguage, translations } = useLanguage();
  
  const t = (key) => translations[key] || key ; // Función para obtener la traducción

  const [permissionActive, setPermissionsActive] = useState([]);

  // const isAdmin = (role? role.name : "") === "admin";

  const isCurrentPath = (path) => {
    if (path === pathname) return true;
    return false;
  };

  useEffect(() => {
    (async () => {
      try {
        setPermissionsActive([]);
        if (role) {
          const response = await permissionController.getPermissionsByRole(
            accessToken,
            role._id,
            true
          );
          setPermissionsActive(response);
        }
      } catch (error) {
        console.error(error);
        setPermissionsActive([]);
      }
    })();
  }, [role]);

  return (
    <Menu fluid vertical icon text className="admin-menu">
      {(
        <>
         {isMaster(role) || isAdmin(role) ||
          hasPermission(permissionActive, role._id, "dashboard", "menu") ? (
          <Menu.Item
            as={Link}
            to="/admin/dashboard"
            active={isCurrentPath("/admin/dashboard")}
          >
            <Icon name="table" />
            {t("dashboard")}
          </Menu.Item>):null}

          {isMaster(role) || isAdmin(role) ||
          hasPermission(permissionActive, role._id, "data", "menu") ? (
            <Dropdown trigger={<span style={{marginRight:"10%"}}><Icon name='upload'/>{t("data")}</span>} floating labeled item>
              <DropdownMenu>
                {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/siteforms"
                    active={isCurrentPath("/admin/data/siteforms")}
                  >
                    <Icon name="file alternate" /> 
                    {t("site")}
                  </DropdownItem>
                ) : null} 
                    {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/productionforms"
                    active={isCurrentPath("/admin/data/productionforms")}
                  >
                    <Icon name="file alternate" /> 
                    {t("production")}
                  </DropdownItem>
                ) : null} 
                    {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/energyforms"
                    active={isCurrentPath("/admin/data/energyforms")}
                  >
                    <Icon name="file alternate" /> 
                    {t("energy")}
                  </DropdownItem>
                ) : null} 
                    {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/waterforms"
                    active={isCurrentPath("/admin/data/waterforms")}
                  >
                    <Icon name="file alternate" /> 
                    {t("water")}
                  </DropdownItem>
                ) : null} 
                      {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/effluentforms"
                    active={isCurrentPath("/admin/data/effluentforms")}
                  >
                    <Icon name="file alternate" /> 
                    {t("effluent")}
                  </DropdownItem>
                ) : null} 
                      {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/wasteforms"
                    active={isCurrentPath("/admin/data/wasteforms")}
                  >
                    <Icon name="file alternate" /> 
                    {t("waste")}
                  </DropdownItem>
                ) : null} 
                       {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/dangerousforms"
                    active={isCurrentPath("/admin/data/dangerousforms")}
                  >
                    <Icon name="file alternate" /> 
                    {"Peligrosos"}
                  </DropdownItem>
                ) : null} 
                         {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "data", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/kpisforms"
                    active={isCurrentPath("/admin/data/kpisforms")}
                  >
                    <Icon name="file alternate" /> 
                    {"KPIs"}
                  </DropdownItem>
                ) : null} 
                          {/* {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "sites", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/siteforms"
                    active={isCurrentPath("/admin/data/siteforms")}
                  >
                    <Icon name="file alternate" /> 
                    {"Residuos"}
                  </DropdownItem>
                ) : null} 
                          {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "sites", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/siteforms"
                    active={isCurrentPath("/admin/data/siteforms")}
                  >
                    <Icon name="file alternate" /> 
                    {"Residuos Peliigrosos"}
                  </DropdownItem>
                ) : null} 
                            {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "sites", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/siteforms"
                    active={isCurrentPath("/admin/data/siteforms")}
                  >
                    <Icon name="file alternate" /> 
                    {"Energia LB"}
                  </DropdownItem>
                ) : null} 
                          {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "sites", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/data/siteforms"
                    active={isCurrentPath("/admin/data/siteforms")}
                  >
                    <Icon name="file alternate" /> 
                    {"KPIs"}
                  </DropdownItem>
                ) : null}  */}
                {isMaster(role) || isAdmin(role) ||
                hasPermission(
                  permissionActive,
                  role._id,
                  "permissions",
                  "menu"
                ) ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/config/permissions"
                    active={isCurrentPath("/admin/config/permissions")}
                  >
                    {" "}
                    {/* <Icon name="clipboard list" /> Permisos */}
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          ) : null} 



          {isMaster(role) || isAdmin(role) ||
          hasPermission(permissionActive, role._id, "users", "menu") ? (
            <Menu.Item
              as={Link}
              to="/admin/users"
              active={isCurrentPath("/admin/users")}
            >
              <Icon name="users" />
              {t("users")}
            </Menu.Item>
          ) : null}

{isMaster(role) || isAdmin(role) ||
          hasPermission(permissionActive, role._id, "reports", "menu") ? (
            <Menu.Item
            as={Link}
            to="/admin/reports"
            active={isCurrentPath("/admin/reports")}
          >
            <Icon name="file outline" />
           {t("reports")}
          </Menu.Item>
          ) : null}

          {/* <Menu.Item
            as={Link}
            to="/admin/menu"
            active={isCurrentPath("/admin/menu")}
          >
            <Icon name="bars" />
            Menu
          </Menu.Item> */}
          {isMaster(role) || 
          hasPermission(permissionActive, role._id, "users", "menu") ? (
          <Menu.Item
            as={Link}
            to="/admin/companies"
            active={isCurrentPath("/admin/companies")}
          >
            <Icon name="building" />
            {t("companies")}
          </Menu.Item>
          ): null}

{isMaster(role) || 
          hasPermission(permissionActive, role._id, "sites", "menu") ? (
            <Menu.Item
            as={Link}
            to="/admin/sites"
            active={isCurrentPath("/admin/sites")}
          >
            <Icon name="building" />
          {t("sites")}
          </Menu.Item>
          ): null}

        

          {/* <Menu.Item
            as={Link}
            to="/admin/roles"
            active={isCurrentPath("/admin/roles")}
          >
            <Icon name="user" />
            Roles
          </Menu.Item> */}

          {/* <Menu.Item
            as={Link}
            to="/admin/config"
            active={isCurrentPath("/admin/config")}
          >
            <Icon name="configure" />
            Configuracion
          </Menu.Item> */}
          {isMaster(role) || isAdmin(role) ||
          hasPermission(permissionActive, role._id, "configure", "menu") ? (
            <Dropdown  item trigger={<span style={{marginRight:"10%"}}><Icon name='configure'/>{t("configure")}</span>} >
              <DropdownMenu>
                {isMaster(role)|| isAdmin(role) ||
                hasPermission(permissionActive, role._id, "roles", "menu") ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/config/roles"
                    active={isCurrentPath("/admin/config/roles")}
                  >
                    {" "}
                    <Icon name="users" />  {t("roles")}
                  </DropdownItem>
                ) : null}
                {isMaster(role) || isAdmin(role) ||
                hasPermission(
                  permissionActive,
                  role._id,
                  "permissions",
                  "menu"
                ) ? (
                  <DropdownItem
                    as={Link}
                    to="/admin/config/permissions"
                    active={isCurrentPath("/admin/config/permissions")}
                  >
                    {" "}
                    <Icon name="clipboard list" /> {t("permissions")}
                  </DropdownItem>
                ) : null}
              </DropdownMenu>
            </Dropdown>
          ) : null}
        </>
      )}
    </Menu>
  );
}
