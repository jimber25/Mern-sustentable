const SERVER_IP = "localhost:3977";

export const ENV = {
  BASE_PATH: `http://${SERVER_IP}`,
  BASE_API: `http://${SERVER_IP}/api/v1`,
  API_ROUTES: {
    REGISTER: "auth/register",
    LOGIN: "auth/login",
    REFRESH_ACCESS_TOKEN: "auth/refresh_access_token",
    USER_ME: "user/me",
    USER: "user",
    USERS: "users",
    MENU: "menu",
    COURSE: "course",
    NEWSLETTER: "newsletter",
    POST: "post",
    COMPANY_ME:"company/me"
  },
  JWT: {
    ACCESS: "access",
    REFRESH: "refresh",
  },
};

export const MODULES = [
  "dashboard",
  "configure",
  "permissions",
  "reports",
  "roles",
  "users",
  "sites",
  "companies",
  // "siteform",
  // "productionform",
  // "energyform",
  // "effluentform",
  // "waterform",
  // "wasteform",
  // "kpisform",
  "data"
];

export const FORMS=[
  "siteform",
  "productionform",
  "energyform",
  "effluentform",
  "waterform",
  "wasteform",
  "kpisform",
  "dangerousform"
];


export const ACTIONS = [
  "delete",
  "create",
  "edit",
  "menu",
  "view",
]

export const PERIODS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
]