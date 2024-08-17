import * as Yup from "yup";

export function initialValues(production) {
  return {
    date: production?.date || "",
    creator_user: production?.creator_user || "",
    state: production?.state || "",
    production_volume: production?.production_volume|| {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    annual_average: production?.average_annual || {
      value:"",
      reviews:[
      ]
    },
    
   
  };
}

export function validationSchema() {
  // return Yup.object({
  //   date: Yup.string().required(true),
  //   creator_user: Yup.string().required(true),
  //   state: Yup.string().required(true),
  //   installation_type: Yup.object({
  //     value: Yup.string().required(),
  //   }),
  // });
}
