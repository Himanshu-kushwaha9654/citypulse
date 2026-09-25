export interface City {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  zoom: number;
  /** "demo" = simulated dataset, "live" = would connect to real API */
  dataMode: 'live' | 'demo';
}

export const CITIES: City[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    zoom: 12,
    dataMode: 'demo',
  },
  {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    zoom: 11,
    dataMode: 'demo',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    zoom: 12,
    dataMode: 'demo',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    zoom: 12,
    dataMode: 'demo',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.3850,
    longitude: 78.4867,
    zoom: 12,
    dataMode: 'demo',
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
    zoom: 12,
    dataMode: 'demo',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    zoom: 12,
    dataMode: 'demo',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    latitude: 22.5726,
    longitude: 88.3639,
    zoom: 12,
    dataMode: 'demo',
  },
];

export const DEFAULT_CITY = CITIES[0]; // Jaipur
