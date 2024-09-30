import * as Yup from "yup";

export function initialValues(energy, period, year) {
  return {
    date: energy?.date || "",
    creator_user: energy?.creator_user || "",
    state: energy?.state || "",
    period:energy?.period || period,
    year:energy?.year || year,
    electricity:energy?.electricity || {
      electricity_standard: energy?.electricity_standard || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      electricity_cost: energy?.electricity_cost || {
        value:"",
        reviews:[
        ]
      },
      renewable_energies:energy?.renewable_energies || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      renewable_energies_produced_and_consumed_on_site:energy?.renewable_energies_produced_and_consumed_on_site || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },     
    },
    fuels:energy?.fuels || {
      steam:energy?.steam || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      steam_cost:energy?.steam_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      natural_gas:energy?.natural_gas || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      natural_gas_cost:energy?.natural_gas_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      glp:energy?.glp || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      glp_cost:energy?.glp_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      heavy_fuel_oil:energy?.natural_gas || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      cost_of_heavy_fuel_oil:energy?.natural_gas_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      light_fuel_oil:energy?.light_fuel_oil || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      cost_of_light_fuel_oil:energy?.cost_of_light_fuel_oil || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      coal:energy?.coal || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      coal_cost:energy?.coal_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      diesel:energy?.diesel || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      diesel_cost:energy?.diesel_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      gasoline_for_internal_vehicles:energy?.gasoline_for_internal_vehicles || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      gasoline_cost_of_internal_vehicles:energy?.gasoline_cost_of_internal_vehicles || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      biomass:energy?.biomass || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
      biomass_cost:energy?.biomass_cost || {
        value:"",
        reviews:[
        ],
        isApproved:false
      },
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
