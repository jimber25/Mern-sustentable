import React, { useState } from "react";
import { Image, Button, Icon, Confirm } from "semantic-ui-react";
import { BasicModal } from "../../../Shared";
import { ENV } from "../../../../utils";
import { Siteform } from "../../../../api";
import { useAuth } from "../../../../hooks";
import { SiteForm } from "../SiteForm";
import "./SiteFormItem.scss";

const siteFormController = new Siteform();

export function SiteFormItem(props) {
  const { siteForm, onReload } = props;
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const { accessToken } = useAuth();

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateSite = () => {
    setTitleModal(`Actualizar ${siteForm.title}`);
    onOpenCloseModal();
  };

  const onDelete = async () => {
    try {
      await siteFormController.deleteSiteForm(accessToken, siteForm._id);
      onReload();
      onOpenCloseConfirm();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="site-form-item">

        <div>
          <Button icon as="a" href={siteForm.url} target="_blank">
            <Icon name="eye" />
          </Button>
          <Button icon primary onClick={openUpdateSite}>
            <Icon name="pencil" />
          </Button>
          <Button icon color="red" onClick={onOpenCloseConfirm}>
            <Icon name="trash" />
          </Button>
        </div>
      </div>

      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal} size={'fullscreen'}>
        <SiteForm
          onClose={onOpenCloseModal}
          onReload={onReload}
          siteForm={siteForm}
        />
      </BasicModal>

      <Confirm
        open={showConfirm}
        onCancel={onOpenCloseConfirm}
        onConfirm={onDelete}
        content={`Eliminar el formulario ${siteForm.title}`}
        size="mini"
      />
    </>
  );
}
