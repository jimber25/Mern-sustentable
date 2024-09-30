import * as Yup from "yup";

export function initialValues(form, period, year) {
  return {
    date: form?.date || "",
    creator_user: form?.creator_user || "",
    period:form?.period || period,
    year:form?.year || year,
    state: form?.state || "",
    municipal_network_water: form?.municipal_network_water || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    cost_of_water_from_the_municipal_network: form?.cost_of_water_from_the_municipal_network || {
      value:"",
      reviews:[
      ]
    },
    rainwater_harvesting:form?.rainwater_harvesting || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    groundwater:form?.groundwater || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    surface_water:form?.surface_water || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    percentage_surface_water:form?.percentage_surface_water || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    percentage_network_water:form?.percentage_network_water || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    percentage_groundwater:form?.percentage_groundwater || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    total_water_consumed_per_unit_produced:form?.total_water_consumed_per_unit_produced || {
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
