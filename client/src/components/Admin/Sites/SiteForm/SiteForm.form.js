import * as Yup from "yup";

export function initialValues(site) {
  return {
    name: site?.name || "",
    cuit: site?.cuit || "",
    address: site?.address || "",
    phone: site?.phone || "",
    email: site?.email || ""
  };
}

export function validationSchema(site) {
  return Yup.object({
    name: Yup.string().required(true),
    cuit: Yup.string().required(true),
    address: Yup.string().required(true),
    phone: Yup.string().required(true),
    email: Yup.string().email(true).required(true),
  });
}
