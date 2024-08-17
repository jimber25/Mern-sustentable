import * as Yup from "yup";

export function initialValues(energy) {
  return {
    date: energy?.date || "",
    creator_user: energy?.creator_user || "",
    state: energy?.state || "",
    standard_electricity: energy?.standard_electricity_in_MHW  || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    Electricity_cost: energy?.electricity_cost || {
      value:"",
      reviews:[
      ]
    },
    Renewable_Energies:energy?.renewable_Energies || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    Renewable_energies_produced:energy?.renewable_energies_produced || {
      value:"",
      reviews:[
      ],
      isApproved:false
    },
    function (fuels) {
      return {
        date: energy?.date || "",
        creator_user: fuels?.creator_user || "",
        state: energy?.state || "",
        steam: energy?.steam  || {
          value:"",
          reviews:[
          ],
          isApproved:false
        },
        Steam: energy?.steam || {
          value:"",
          reviews:[
          ]
        },
        Cost_steam: energy?.steam_cost || {
          value:"",
          reviews:[
          ]
        },
        Natural_gas:energy?.natural_gas || {
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
        Liquefied_petroleum_gas:energy?.liquefied_petroleum_gas || {
          value:"",
          reviews:[
          ],
          isApproved:false
        },
        liquefied_petroleum_gas_cost:energy?.liquefied_petroleum_gas_cost|| {
          value:"",
          reviews:[
          ],
          isApproved:false
        },
        heavy_fuel_oil:energy?.heavy_fuel_oil || {
          value:"",
          reviews:[
          ],
          isApproved:false
        },
        heavy_fuel_oil_cost:energy?.heavy_fuel_oil_cost || {
          value:"",
          reviews:[
          ],
          isApproved:false
        },
        light_fuel_oil:energy?.light_fuel_oil|| {
          value:"",
          reviews:[
          ],
          isApproved:false
        },
        light_fuel_oil_cost:energy?.heavy_fuel_oil_cost || {
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
        gasoline_cost_for_internal_vehicles:energy?.gasoline_for_internal_vehicles_cost|| {
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
       
      };
    }
  }
  };


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
