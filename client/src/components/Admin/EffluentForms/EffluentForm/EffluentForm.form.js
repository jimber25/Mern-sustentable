import * as Yup from "yup";

export function initialValues(effluent) {
  return {
    date: effluent?.date || "",
    creator_user: effluent?.creator_user || "",
    state: effluent?.state || "",
    total_domestic_effluents: effluent?.total_domestic_effluents || {
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    total_industrial_effluents: effluent?.total_industrial_effluents || {
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    sludge_mud_sent_for_disposal_landfill:effluent?.sludge_mud_sent_for_disposal_landfill || {
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    total_effluents_per_unit_produced:effluent?.total_effluents_per_unit_produced || {
      value:0,
      reviews:[
      ],
      isApproved:false
    },
    percentage_domestic_effluents:effluent?.percentage_domestic_effluents || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    percentage_industrial_effluents:effluent?.percentage_industrial_effluents || {
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
