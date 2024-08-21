import React, { useEffect, useState } from "react";
import {
  Menu,
  Icon,
  DropdownMenu,
  Dropdown,
  DropdownItem,
  DropdownHeader,
  Segment,
  Tab,
  TabPane,
  Header,
  Grid,
  GridColumn,
} from "semantic-ui-react";
import { Line, Pie, Column } from "@ant-design/charts";
import { Link, useLocation } from "react-router-dom";
import { Permission } from "../../../../api";
import { useAuth } from "../../../../hooks";
import "./Dashboard.scss";
import { hasPermission, isAdmin } from "../../../../utils/checkPermission";

const permissionController = new Permission();

export function DashBoard() {
  const { pathname } = useLocation();
  const {
    user: { role },
    accessToken,
  } = useAuth();

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

  const panes = [
    {
      menuItem: "Overview",
      render: () => (
        <TabPane attached={false}>
          {" "}
          <div>
          <Grid columns={2} divided>
            <GridColumn textAlign="center">
              <div className="chart-container">
              <Line {...config}  
            />
              </div>
            </GridColumn>
            <GridColumn>
            <div className="chart-container">
            <Column {...config3} />
            </div>
            </GridColumn>
          </Grid>
          <Grid columns={2} divided>
            <GridColumn>
            <div className="chart-container">
              <Line {...config} />
              </div>
            </GridColumn>
            <GridColumn>
            <div className="chart-container">
            <Column {...config3} />
            </div>
            </GridColumn>
          </Grid>
          </div>
        </TabPane>
      ),
    },
    {
      menuItem: "Energia",
      render: () => (
        <TabPane attached={false}>
          <Pie {...config2} />
        </TabPane>
      ),
    },
    {
      menuItem: "Combustible",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Aguas",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Efluentes",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Residuos",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Peligrosos",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Social",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
  ];

  const subPanes = [
    {
      menuItem: "Overview",
      render: () => (
        <TabPane attached={false}>
          {" "}
          <Grid columns={2}>
            <GridColumn>
              <Line {...config} />
            </GridColumn>
            <GridColumn>
              <Line {...config} />
            </GridColumn>
          </Grid>{" "}
        </TabPane>
      ),
    },
    {
      menuItem: "Energia",
      render: () => (
        <TabPane attached={false}>
          <Pie {...config2} />
        </TabPane>
      ),
    },
    {
      menuItem: "Combustible",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Aguas",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Efluentes",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Residuos",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Peligrosos",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
    {
      menuItem: "Social",
      render: () => (
        <TabPane attached={false}>
          <Column {...config3} />
        </TabPane>
      ),
    },
  ];

  const data = [
    { year: "1991", value: 3 },
    { year: "1992", value: 4 },
    { year: "1993", value: 3.5 },
    { year: "1994", value: 5 },
    { year: "1995", value: 4.9 },
    { year: "1996", value: 6 },
    { year: "1997", value: 7 },
    { year: "1998", value: 9 },
    { year: "1999", value: 13 },
  ];

  const config = {
    data,
    height: 400,
    xField: "year",
    yField: "value",
  };

  const config2 = {
    data: [
      { type: "opcion 1", value: 27 },
      { type: "opcion 2", value: 25 },
      { type: "opcion 3", value: 18 },
      { type: "opcion 4", value: 15 },
      { type: "opcion 5", value: 10 },
      { type: "opcion 6", value: 5 },
    ],
    angleField: "value",
    colorField: "type",
    label: {
      text: "value",
      style: {
        fontWeight: "bold",
      },
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  };

  const data2 = [0.16, 0.125, 0.24, 0.19, 0.22, 0.05, 0.01, 0.015];

  const config3 = {
    data: data2.map((value) => ({
      index: value.toString(),
      value,
    })),
    xField: "index",
    yField: "value",
  };

  return (
    <>
      <Segment textAlign="center">
        {" "}
        <Header as="h">BIENVENIDO {useAuth().user.email}</Header>
      </Segment>
      <Tab
        //  menu={{ pointing: true }}
        menu={{ borderless: true, attached: false, tabular: false }}
        panes={panes}
      />
    </>
  );
}
