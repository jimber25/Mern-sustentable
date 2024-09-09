export function convertActionsEngToEsp (a) {
    switch (a) {
        case "create":
            return "Crear";
        case "edit":
            return "Editar";
        case "delete":
            return "Eliminar";
        case "view":
            return "Ver";
        case "menu":
            return "Menu";
        default:
            return null;
    }
};

export function convertModulesEngToEsp (a) {
    switch (a) {
        case "users":
            return "Usuarios";
        case "roles":
            return "Roles";
        case "permissions":
            return "Permisos";
        case "configure":
            return "Configuracion";
        case "reports":
            return "Reportes";
        case "dashboard":
            return "Dashboard";
        case "companies":
            return "Empresas";
        case "sites":
            return "Sitios";
        case "siteform":
            return "Formulario de Sitio";
        case "energyform":
            return "Formulario de Energia";
        case "productionform":
            return "Formulario de Producción";
        case "effluentform":
            return "Formulario de Efluentes";
        case "waterform":
            return "Formulario de Agua";       
        default:
            return null;
    }
};

export function convertPeriodsEngToEsp (a) {
    switch (a) {
        case "January":
            return "Enero";
        case "February":
            return "Febrero";
        case "March":
            return "Marzo";
        case "April":
            return "Abril";
        case "May":
            return "Mayo";
        case "June":
            return "Junio";
        case "July":
            return "Julio";
        case "August":
            return "Agosto";
        case "September":
            return "Septiembre";
        case "October":
            return "Octubre";
        case "November":
            return "Noviembre";
        case "December":
            return "Diciembre";
        default:
            return null;
    }
};

export function convertEffluentFieldsEngToEsp (a) {
    switch (a) {
        case "total_domestic_effluents":
            return "Total efluentes domésticos ";
        case "total_industrial_effluents":
            return "Total efluentes industriales";
        case "sludge_mud_sent_for_disposal_landfill":
            return "Lodos/ Barros ";
        case "total_effluents_per_unit_produced":
            return "Total efluentes";
        case "percentage_domestic_effluents":
            return "Costo de tratamiento de efluentes";
        case "percentage_industrial_effluents":
            return "Costo tratamiento de lodos";
        default:
            return null;
    }
};
