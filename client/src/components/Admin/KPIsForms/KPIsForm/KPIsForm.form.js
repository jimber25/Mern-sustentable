import * as Yup from "yup";
import { kpisCodes } from "../../../../utils/codes";

const currentYear = new Date().getFullYear();


export function initialValues(form, period, year) {
  return {
    date: form?.date || "",
    period: form?.period || period,
    year:form?.year || year,
    creator_user: form?.creator_user || "",
    state: form?.state || "",
    energy_indicators:form?.energy_indicators || {
      total_fuel_energy_consumption: form?.total_fuel_energy_consumption || {
        code:kpisCodes["total_fuel_energy_consumption"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_electrical_energy_consumption: form?.total_electrical_energy_consumption || {
        code:kpisCodes["total_electrical_energy_consumption"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_energy_consumption:form?.total_energy_consumption || {
        code:kpisCodes["total_energy_consumption"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_renewable_energy:form?.total_renewable_energy || {
        code:kpisCodes["total_renewable_energy"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      percentage_of_renewable_energy:form?.percentage_of_renewable_energy || {
        code:kpisCodes["percentage_of_renewable_energy"],
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      percentage_energy_from_fossil_fuels:form?.percentage_energy_from_fossil_fuels || {
        code:kpisCodes["percentage_energy_from_fossil_fuels"],
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      total_energy_consumed_per_productive_unit:form?.total_energy_consumed_per_productive_unit || {
        code:kpisCodes["total_energy_consumed_per_productive_unit"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_cost_of_energy_consumed:form?.total_cost_of_energy_consumed || {
        code:kpisCodes["total_cost_of_energy_consumed"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
    },
    greenhouse_gas_indicators:form?.greenhouse_gas_indicators || {
      total_scope_1: form?.total_scope_1 || {
        code:kpisCodes["total_fuel_entotal_scope_1ergy_consumption"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_scope_2: form?.total_scope_2 || {
        code:kpisCodes["total_scope_2"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_scope_3:form?.total_scope_3 || {
        code:kpisCodes["total_scope_3"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_emissions_per_unit_produced:form?.total_emissions_per_unit_produced || {
        code:kpisCodes["total_emissions_per_unit_produced"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      total_emissions:form?.total_emissions || {
        code:kpisCodes["total_emissions"],
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      scope_percentage_1:form?.scope_percentage_1 || {
        code:kpisCodes["scope_percentage_1"],
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      scope_percentage_2:form?.scope_percentage_2 || {
        code:kpisCodes["scope_percentage_2"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
      scope_percentage_3:form?.scope_percentage_3 || {
        code:kpisCodes["scope_percentage_3"],
        value:0,
        reviews:[
        ],
        isApproved:false
      },
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
