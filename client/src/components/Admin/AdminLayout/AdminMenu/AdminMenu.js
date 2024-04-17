import React, {useEffect, useState} from "react";
import { Menu, Icon, DropdownMenu, Dropdown, DropdownItem, DropdownHeader } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../../hooks";
import "./AdminMenu.scss";

export function AdminMenu() {
  const { pathname } = useLocation();
  const {
    user: { role },
  } = useAuth();

  const isAdmin = (role? role.name : "") === "admin";

  const isCurrentPath = (path) => {
    if (path === pathname) return true;
    return false;
  };

  return (
    <Menu fluid vertical icon text className="admin-menu">
      {isAdmin && (
        <>
          <Menu.Item
            as={Link}
            to="/admin/users"
            active={isCurrentPath("/admin/users")}
          >
            <Icon name="users" />
            Usuarios
          </Menu.Item>

          <Menu.Item
            as={Link}
            to="/admin/menu"
            active={isCurrentPath("/admin/menu")}
          >
            <Icon name="bars" />
            Menu
          </Menu.Item>

          {/* <Menu.Item
            as={Link}
            to="/admin/roles"
            active={isCurrentPath("/admin/roles")}
          >
            <Icon name="user" />
            Roles
          </Menu.Item> */}

          <Menu.Item
            as={Link}
            to="/admin/newsletter"
            active={isCurrentPath("/admin/newsletter")}
          >
            <Icon name="mail" />
            Newsletter
          </Menu.Item>

          {/* <Menu.Item
            as={Link}
            to="/admin/config"
            active={isCurrentPath("/admin/config")}
          >
            <Icon name="configure" />
            Configuracion
          </Menu.Item> */}

          <Dropdown item icon="configure"  text='Configuracion'>
          <DropdownMenu>
            <DropdownItem
            as={Link}
            to="/admin/config/roles"
            active={isCurrentPath("/admin/config/roles")}
            > <Icon name="users" /> Roles</DropdownItem>
            <DropdownItem
                as={Link}
                to="/admin/config/permissions"
                active={isCurrentPath("/admin/config/permissions")}
                > <Icon name="clipboard list" /> Permisos</DropdownItem>
          </DropdownMenu>
        </Dropdown>
        </>
      )}

      <Menu.Item
        as={Link}
        to="/admin/blog"
        active={isCurrentPath("/admin/blog")}
      >
        <Icon name="comment alternate outline" />
        Blog
      </Menu.Item>
    </Menu>
  );
}