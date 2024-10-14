import * as Yup from "yup";
import { productionCodes } from "../../../../utils/codes";

export function initialValues(production, period, year) {
  return {
    date: production?.date || "",
    creator_user: production?.creator_user || "",
    state: production?.state || "",
    site:production?.site || "",
    period:production?.period || period,
    year:production?.year || year,
    production_volume: production?.production_volume|| {
      code:productionCodes["production_volume"],
      unit:"",
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    annual_average: production?.annual_average || {
      code:productionCodes["annual_average"],
      unit:"",
      value:"",
      reviews:[
      ],
      isApproved:false
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
