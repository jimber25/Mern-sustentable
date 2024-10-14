export const effluentCodes = {
  total_domestic_effluents: "EF1",
  total_industrial_effluents: "EF2",
  sludge_mud_sent_for_disposal_landfill: "EF3",
  total_effluents_per_unit_produced: "EF4",
  percentage_domestic_effluents: "EF5",
  percentage_industrial_effluents: "EF6",
};

export const waterCodes = {
  municipal_network_water: "W1",
  cost_of_water_from_the_municipal_network: "w2",
  rainwater_harvesting: "EF3",
  groundwater: "EF4",
  surface_water: "EF5",
  percentage_network_water: "EF6",
  percentage_surface_water: "EF7",
  percentage_groundwater:"EF8",
  total_water_consumed_per_unit_produced:"EF9"
};

export const productionCodes = {
  production_volume: "PF1",
  annual_average: "PF2",
};

export const siteCodes = {
  installation_type: "SF1",
  product_category: "SF2",
  days_month: "SF3",
  days_total: "SF4",
  hours_month: "SF5",
  hours_total: "SF6",
  temporary_workers: "SF7",
  permanent_production_workers: "SF8",
  permanent_administrative_workers: "SF9",
  female_production_workers: "SF10",
  male_production_workers: "SF11",
  female_administrative_workers: "SF12",
  male_administrative_workers: "SF13",
  female_workers_leadership_positions: "SF14",
  male_workers_leadership_positions: "SF15",
  average_total_workers: "SF16",
  average_female_workers: "SF17",
  average_male_workers: "SF18",
  percentage_total_female: "SF19",
  percentage_total_male: "SF20",
  percentage_female_leadership_positions: "SF21",
  percentage_male_leadership_positions: "SF22",
  work_accidents_with_sick_days: "SF23",
  first_aid_without_sick_days: "SF24",
};

export const wasteCodes = {
    paper_and_cardboard_sent_to_recycling_or_reuse: "SF1",
    plastic_sent_to_recycle_or_reuse: "SF2",
    fabric_sent_to_recycle_or_reuse: "SF3",
    metal_sent_to_recycle_or_reuse: "SF4",
    wood_sent_to_recycle_or_reuse: "SF5",
    other_general_waste_sent_to_recycle_or_reuse: "SF6",
    leathers_sent_to_recycle_or_reuse: "SF7",
    rubber_sent_to_recycle_or_reuse: "SF8",
    food_scraps_sent_to_recycle_or_reuse: "SF9",
    paper_and_cardboard_sent_to_incineration: "SF10",
    plastic_sent_to_incineration: "SF11",
    fabric_sent_to_incineration: "SF12",
    metal_sent_to_incineration: "SF13",
    wood_sent_to_incineration: "SF14",
    other_general_waste_sent_to_incineration: "SF15",
    other_general_waste_sent_to_other_types_of_disposal: "SF16",
    total_sent_to_landfill: "SF17",
    total_sent_for_reuse_or_recycling: "SF18",
    total_sent_to_incineration:"SF19",
    total_general_waste_sent_to_other_types_of_disposal: "SF20",
    total_non_hazardous_waste_unit_produced: "SF21",
};

export const dangerousCodes = {
    chemicals_sent_to_reuse_or_recycle: "PF1",
    lubricants_sent_to_reuse_or_recycle: "PF2",
    oils_sent_to_reuse_or_recycle: "PF1",
    machines_and_equipment_sent_to_reuse_or_recycle: "PF2",
    electronic_waste_sent_to_reuse_or_recycle: "PF1",
    other_dangerous_wastes_sent_to_reuse_or_recycle: "PF2",
    chemicals_sent_to_incineration: "PF1",
    lubricants_sent_to_incineration: "PF2",
    oils_sent_to_incineration: "PF1",
    machines_and_equipment_sent_to_incineration: "PF2",
    electronic_waste_sent_to_incineration: "PF1",
    other_dangerous_wastes_sent_to_incineration: "PF2",
    chemicals_sent_to_landfill: "PF1",
    lubricants_sent_to_landfill: "PF2",
};

export const energyCodes = {
    electricity_standard: "PF1",
    electricity_cost: "PF2",
    renewable_energies: "PF1",
    renewable_energies_produced_and_consumed_on_site: "PF2",
    steam: "PF1",
    steam_cost: "PF2",
    natural_gas: "PF1",
    natural_gas_cost: "PF2",
    glp: "PF1",
    glp_cost: "PF2",
    heavy_fuel_oil: "PF1",
    cost_of_heavy_fuel_oil: "PF2",
    light_fuel_oil: "PF1",
    cost_of_light_fuel_oil: "PF2",
    coal:"En",
    coal_cost:"E",
    diesel:"En",
    diesel_cost:"En",
    gasoline_for_internal_vehicles:"En",
    gasoline_cost_of_internal_vehicles:"En",
    biomass:"En",
    biomass_cost:"En"
};

export const kpisCodes = {
    total_fuel_energy_consumption: "PF1",
    total_electrical_energy_consumption: "PF2",
    total_energy_consumption: "PF1",
    total_renewable_energy: "PF2",
    percentage_of_renewable_energy: "PF1",
    percentage_energy_from_fossil_fuels: "PF2",
    total_energy_consumed_per_productive_unit: "PF1",
    total_cost_of_energy_consumed: "PF2",
    total_scope_1: "PF1",
    total_scope_2: "PF2",
    total_scope_3: "PF2",
    total_emissions_per_unit_produced:"En",
    total_emissions:"E",
    scope_percentage_1:"En",
    scope_percentage_2:"En",
    scope_percentage_3:"En",
};

export const energyFieldMain=[
  "electricity",
  "fuels"
]

export const kpisFieldMain=[
  "energy_indicators",
  "greenhouse_gas_indicators"
]