import * as Yup from "yup";

export function initialValues(form, period, year) {
  return {
    date: form?.date || "",
    creator_user: form?.creator_user || "",
    period:form?.period || period,
    year:form?.year || year,
    state: form?.state || "",
    paper_and_cardboard_sent_to_recycling_or_reuse: form?.paper_and_cardboard_sent_to_recycling_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    plastic_sent_to_recycle_or_reuse: form?.plastic_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ]
    },
    fabric_sent_to_recycle_or_reuse:form?.fabric_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    metal_sent_to_recycle_or_reuse:form?.metal_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    wood_sent_to_recycle_or_reuse:form?.wood_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    other_general_waste_sent_to_recycle_or_reuse:form?.other_general_waste_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    leathers_sent_to_recycle_or_reuse:form?.leathers_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    rubber_sent_to_recycle_or_reuse:form?.rubber_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    food_scraps_sent_to_recycle_or_reuse:form?.food_scraps_sent_to_recycle_or_reuse || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    paper_and_cardboard_sent_to_incineration:form?.paper_and_cardboard_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    plastic_sent_to_incineration:form?.plastic_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    fabric_sent_to_incineration:form?.fabric_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    metal_sent_to_incineration:form?.metal_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    wood_sent_to_incineration:form?.wood_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    other_general_waste_sent_to_incineration:form?.other_general_waste_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    other_general_waste_sent_to_other_types_of_disposal:form?.other_general_waste_sent_to_other_types_of_disposal || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    total_sent_to_landfill:form?.total_sent_to_landfill || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    total_sent_for_reuse_or_recycling:form?.total_sent_for_reuse_or_recycling || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    total_sent_to_incineration:form?.total_sent_to_incineration || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    
    total_general_waste_sent_to_other_types_of_disposal:form?.total_general_waste_sent_to_other_types_of_disposal || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    total_non_hazardous_waste_unit_produced:form?.total_non_hazardous_waste_unit_produced || {
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
