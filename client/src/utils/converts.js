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
        default:
            return null;
    }
};