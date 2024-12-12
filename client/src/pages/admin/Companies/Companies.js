import React, { useState, useEffect } from "react";
import { Tab, Button, Icon } from "semantic-ui-react";
import { BasicModal } from "../../../components/Shared";
import { CompanyForm, ListCompanies } from "../../../components/Admin/Companies";
import "./Companies.scss";
import { useAuth } from "../../../hooks";
import { isAdmin, hasPermission, isMaster } from "../../../utils/checkPermission";
import { ErrorAccessDenied } from "../Error";
import { Permission } from "../../../api";
import { useLanguage } from "../../../contexts";

const permissionController = new Permission();

export function Companies() {
  const [showModal, setShowModal] = useState(false);
  const [reload, setReload] = useState(false);
  const {
    accessToken,
    user: { role },
  } = useAuth();
  
  const { language, changeLanguage, translations } = useLanguage();
  
  const t = (key) => translations[key] || key ; // Función para obtener la traducción

  const [permissionsByRole, setPermissionsByRole] = useState([]);
  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onReload = () => setReload((prevState) => !prevState);

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

  const panes = [
    {
      menuItem: t("active_companies"),
      render: () => (
        <Tab.Pane attached={false}>
          <ListCompanies companiesActive={true} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: t("inactive_companies"),
      render: () => (
        <Tab.Pane attached={false}>
          <ListCompanies companiesActive={false} reload={reload} onReload={onReload} />
        </Tab.Pane>
      ),
    },
  ];

  if (
    isMaster(role) ||
    hasPermission(permissionsByRole, role._id, "companies", "view")
  ) {
    return (
      <>
        <div className="companies-page">
          {isMaster(role) ||
          hasPermission(permissionsByRole, role._id, "companies", "create") ? (
            <Button
              className="users-page__add"
              primary
              onClick={onOpenCloseModal}
            >
              <Icon name='plus' /> {t("new_company")}
            </Button>
          ) : null}
          <Tab menu={{ secondary: true }} panes={panes} />
        </div>

        <BasicModal
          show={showModal}
          close={onOpenCloseModal}
          title={t("create")}
        >
          <CompanyForm close={onOpenCloseModal} onReload={onReload} />
        </BasicModal>
      </>
    );
  } else {
    return <ErrorAccessDenied />;
  }
}
