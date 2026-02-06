
export interface RegionData {
  region: string;
  states: string[];
  density_2006: number;
  density_2026_est: number;
  cagr_20yr: string;
  resilience_priority: 'Critical' | 'High' | 'Moderate' | 'High_Tactical';
  primary_hazards: string[];
  infrastructure_strain_index: number;
}

export const NATIONAL_RESILIENCE_DATA: {
  country: string;
  data_version: string;
  unit: string;
  regions: RegionData[];
} = {
  "country": "India",
  "data_version": "2026.1_EST",
  "unit": "people_per_km2",
  "regions": [
    {
      "region": "North / Indo-Gangetic Plain",
      "states": ["Bihar", "Uttar Pradesh", "Punjab", "Haryana"],
      "density_2006": 680,
      "density_2026_est": 1120,
      "cagr_20yr": "2.5%",
      "resilience_priority": "Critical",
      "primary_hazards": ["Heat Stress", "Groundwater Depletion", "Flooding"],
      "infrastructure_strain_index": 0.89
    },
    {
      "region": "East",
      "states": ["West Bengal", "Odisha", "Jharkhand"],
      "density_2006": 590,
      "density_2026_est": 780,
      "cagr_20yr": "1.4%",
      "resilience_priority": "High",
      "primary_hazards": ["Cyclones", "Sea-level Rise", "Coastal Erosion"],
      "infrastructure_strain_index": 0.72
    },
    {
      "region": "West",
      "states": ["Maharashtra", "Gujarat", "Rajasthan"],
      "density_2006": 240,
      "density_2026_est": 345,
      "cagr_20yr": "1.8%",
      "resilience_priority": "Moderate",
      "primary_hazards": ["Drought", "Urban Heat Island", "Industrial Pollution"],
      "infrastructure_strain_index": 0.65
    },
    {
      "region": "South",
      "states": ["Karnataka", "Tamil Nadu", "Kerala", "Andhra Pradesh", "Telangana"],
      "density_2006": 410,
      "density_2026_est": 525,
      "cagr_20yr": "1.2%",
      "resilience_priority": "Moderate",
      "primary_hazards": ["Water Scarcity", "Urban Flooding", "Coastal Surge"],
      "infrastructure_strain_index": 0.58
    },
    {
      "region": "Himalayan & North-East",
      "states": ["HP", "UK", "Sikkim", "Arunachal", "Assam"],
      "density_2006": 120,
      "density_2026_est": 165,
      "cagr_20yr": "1.6%",
      "resilience_priority": "High_Tactical",
      "primary_hazards": ["Landslides", "Seismic Activity", "Flash Floods"],
      "infrastructure_strain_index": 0.45
    }
  ]
};
