import React , { useState, useEffect } from "react";
import { Button, Icon as IconUI } from "semantic-ui-react";
import { Icon } from "../../assets";
import { AdminMenu, Logout } from "../../components/Admin/AdminLayout";
import "./AdminLayout.scss";
import { useAuth } from "../../hooks";
import { BasicModal } from "../../components/Shared";
import { UserForm } from "../../components/Admin/Users/UserForm";

export function AdminLayout(props) {
  const { children } = props;
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const [onReload, setOnReload] = useState(false);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);
  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);

  const openUpdateUser = () => {
    setTitleModal(`Actualizar ${user.email}`);
    onOpenCloseModal();
  };

//   useEffect(() => {
//     getUserByIdApi(accessToken, userToken._id).then(response => {
//         setUserProfile(response.user);
//     });
//     setReloadUsers(false);
// }, [accessToken, reloadUsers]);

  return (
    <div className="admin-layout">
      <div className="admin-layout__left">
        <Icon.LogoWhite className="logo" />
        <AdminMenu />
      </div>
      <div className="admin-layout__right">
        <div className="admin-layout__right-header">
        <Button icon onClick={e=>{openUpdateUser()}}>
    <IconUI name='user' />
  </Button>
          <Logout />
        </div>
        <div className="admin-layout__right-content">{children}</div>
      </div>
      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <UserForm close={onOpenCloseModal} onReload={onReload} user={user} />
      </BasicModal>
    </div>
  );
}