import * as Yup from "yup";
import { effluentCodes } from "../../../../utils/codes";

const currentYear = new Date().getFullYear();


export function initialValues(effluent, period, year) {
  return {
    date: effluent?.date || "",
    period: effluent?.period || period,
    year:effluent?.year || year,
    creator_user: effluent?.creator_user || "",
    state: effluent?.state || "",
    total_domestic_effluents: effluent?.total_domestic_effluents || {
      code:effluentCodes["total_domestic_effluents"],
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    total_industrial_effluents: effluent?.total_industrial_effluents || {
      code:effluentCodes["total_industrial_effluents"],
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    sludge_mud_sent_for_disposal_landfill:effluent?.sludge_mud_sent_for_disposal_landfill || {
      code:effluentCodes["sludge_mud_sent_for_disposal_landfill"],
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    total_effluents_per_unit_produced:effluent?.total_effluents_per_unit_produced || {
      code:effluentCodes["total_effluents_per_unit_produced"],
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    percentage_domestic_effluents:effluent?.percentage_domestic_effluents || {
      code:effluentCodes["percentage_domestic_effluents"],
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    percentage_industrial_effluents:effluent?.percentage_industrial_effluents || {
      code:effluentCodes["percentage_industrial_effluents"],
      value:"",
      reviews:[
      ],
      isApproved:false
    }
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
