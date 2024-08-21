import React, { useState, useEffect } from "react";
import {
  Button,
  Icon as IconUI,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Header,
  HeaderContent,
  Label,
  Menu,
  Confirm
} from "semantic-ui-react";
import { Icon } from "../../assets";
import { AdminMenu, Logout } from "../../components/Admin/AdminLayout";
import "./AdminLayout.scss";
import { useAuth } from "../../hooks";
import { BasicModal } from "../../components/Shared";
import { UserForm } from "../../components/Admin/Users/UserForm";
import { Site } from "../../api";
import { useSite } from "../../contexts/SiteContext";
import { formatDateView } from "../../utils/formatDate";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import 'moment/locale/es'; //importo el lenguaje en español
//import "moment/locale/en";
//import "moment/locale/fr";

const siteController = new Site();

export function AdminLayout(props) {
  const { children } = props;
  const { user } = useAuth();

  // const { site } = useSite();

  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");

  const [reload, onReload] = useState(false);

  const onOpenCloseModal = () => setShowModal((prevState) => !prevState);

  const openUpdateUser = () => {
    setTitleModal(`Actualizar ${user.email}`);
    onOpenCloseModal();
  };

  useEffect(() => {
    if (reload) {
      window.location.reload();
      onReload(false);
    }
  }, [reload]);

  return (
    <div className="admin-layout">
      <div className="admin-layout__left">
        {/* <Icon.LogoWhite className="logo" /> // aca iria el logo de la empresa sustemia */}
      <div style={{ marginTop: "50px" }}></div>
        <AdminMenu />
      </div>
      <div className="admin-layout__right">
      <div className="admin-layout__right-pre">
        <div style={{float:"left"}}> {
          moment().format('LLLL')
        //formatDateView(new Date())
        }</div>
      </div>
        <div className="admin-layout__right-header">
          {/* <SiteSelector /> */}
          <LanguageSelector/>
          {/* <Button
            icon="bars"
            //basic
            //primary
            // circular={true}
            onClick={(e) => {
              openUpdateUser();
            }}
          > */}
            {/* <IconUI name="user" /> {user.email} */}
          {/* </Button> */}
          <Profile updateUser={openUpdateUser}/>
          <Label size="large" basic>
    <IconUI name="user" />  {user.email}
  </Label>
          {/* <Button
            icon="bars"
            //primary
            circular={true}
            // onClick={(e) => {
            //   openUpdateUser();
            // }}
          >
            <IconUI name="user" /> {user.email}
          </Button> */}
          {/* <Logout /> */}
        </div>
        <div className="admin-layout__right-content">{children}</div>
      </div>
      <BasicModal show={showModal} close={onOpenCloseModal} title={titleModal}>
        <UserForm close={onOpenCloseModal} onReload={onReload} user={user} />
      </BasicModal>
    </div>
  );
}

const SiteSelector = () => {
  const [listSites, setListSites] = useState([]);
  const { site, changeSite } = useSite();
  const handleChange = (event, data) => {
    changeSite(data.value);
  };
  const { accessToken } = useAuth();

  useEffect(() => {
    (async () => {
      const response = await siteController.getSites(accessToken);
      if (response) {
        setListSites(response);
      } else {
        setListSites([]);
      }
    })();
  }, [listSites]);

  return (
    <div style={{ 
      background: "white"}}>
      <span>
        Sitio{" "}
        <Dropdown
          // placeholder='Selecciona una opción'
          // text='Sitio'
          //button
          //className='icon'
          floating
          labeled
          //icon='world'
          style={{ 
            background: "transparent",
            boxShadow: "none",
            border: "none",
            color: "black" }}
          search
          options={listSites.map((option) => ({
            key: option._id,
            text: option.name,
            value: option._id,
          }))}
          onChange={handleChange}
          value={site}
        />
      </span>
    </div>
  );
};

export default SiteSelector;

function LanguageSelector (props) {
  const [listLanguages, setListLanguages] = useState([]);
  //const { language, changeLanguage } = useLanguage();//deberia mantener el estado del idioma crear otro contexto
  const [ language, setLanguage]=useState("Español");

  const handleChange = (event, data) => {
    setLanguage(data.value);
  };
  const { accessToken } = useAuth();

  useEffect(() => {
    (async () => {
      // const response = await siteController.getSites(accessToken);
      // if (response) {
      //   setListLanguages(response);
      // } else {
      //   setListLanguages([]);
      // }
      setListLanguages(["Español", "Ingles", "Frances"])
    })();
  }, []);

  return (
    <div  style={{ marginRight:"50px"}}>
        <Dropdown
          button
          className='icon'
          floating
          labeled
          icon='world'
          //icon='world'
          style={{background:"transparent", border:"none", color:"white",  "boxShadow": "none"}}
          search
          options={listLanguages.map((option) => ({
            key: option,
            text: option,
            value: option,
          }))}
          onChange={handleChange}
          value={language}
        />
        </div>
  );
};

function Profile (props) {
  const {updateUser}=props;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);

  const onOpenCloseConfirm = () => setShowConfirm((prevState) => !prevState);


  const handleProfileEdit = () => {
    console.log('Editar perfil');
    // Aquí puedes redirigir a la página de edición de perfil o abrir un modal
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  return (
    <div style={{marginRight:"30px"}}>
      <Dropdown icon="bars" style={{background:"transparent", border:"none", color:"white",  "boxShadow": "none", "height":'150px !important'}}>
        <DropdownMenu>
        <DropdownItem  icon="edit" onClick={()=>{updateUser()}}  text='Editar perfil' />
      <DropdownItem icon="power off" onClick={()=> {onOpenCloseConfirm()}} text='Cerrar sesión'  />
        </DropdownMenu>
      </Dropdown>
      <Confirm
        open={showConfirm}
        onConfirm={handleLogout}
        onCancel={onOpenCloseConfirm}
        cancelButton={"Cancelar"}
        confirmButton={"Aceptar"}
        content={`¿Está seguro que desea cerrar sesión?`}
        size="mini"
      />
    </div>
  );
};