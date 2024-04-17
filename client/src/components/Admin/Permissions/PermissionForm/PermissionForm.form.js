import * as Yup from "yup";

export function initialValues(permission) {
  return {
    description: permission?.description || "",
    module: permission?.module || "",
    action: permission?.action || "",
    role: permission?.role || null
  };
}

export function validationSchema(user) {
  return Yup.object({
    // name: Yup.string().required(true)
  });
}
