
import { SOSAlert, Responder, Shelter, Severity, GeoLocation } from '../types';

// Updated to Mumbai, India for context alignment
const DEFAULT_CENTER = { lat: 19.0760, lng: 72.8777 };

export const generateMockAlerts = (count: number, center: GeoLocation = DEFAULT_CENTER): SOSAlert[] => {
  const alerts: SOSAlert[] = [];
  const names = ["Sarah Jenkins", "Robert Miller", "Elena Rodriguez", "Marcus Chen", "David Wilson"];
  const messages = [
    "Flooding in basement, rising fast.",
    "Trapped on roof with two children.",
    "Medical emergency, insulin required.",
    "Road washed out, stuck in vehicle.",
    "Elderly neighbor unresponsive."
  ];

  for (let i = 0; i < count; i++) {
    alerts.push({
      id: `alert-${i}-${Math.random().toString(36).substr(2, 4)}`,
      location: {
        lat: center.lat + (Math.random() - 0.5) * 0.1,
        lng: center.lng + (Math.random() - 0.5) * 0.1
      },
      severity: (Math.floor(Math.random() * 5) + 1) as Severity,
      timestamp: Date.now() - Math.floor(Math.random() * 3600000),
      message: messages[Math.floor(Math.random() * messages.length)],
      status: 'pending',
      citizenName: names[Math.floor(Math.random() * names.length)]
    });
  }
  return alerts;
};

export const generateMockResponders = (count: number, center: GeoLocation = DEFAULT_CENTER): Responder[] => {
  const responders: Responder[] = [];
  const types: Array<Responder['type']> = ['rescue', 'medical', 'supply'];
  
  for (let i = 0; i < count; i++) {
    responders.push({
      id: `resp-${i}`,
      name: `UNIT-${String.fromCharCode(65 + i)}-${10 + i}`,
      location: {
        lat: center.lat + (Math.random() - 0.5) * 0.08,
        lng: center.lng + (Math.random() - 0.5) * 0.08
      },
      status: 'idle',
      type: types[i % types.length]
    });
  }
  return responders;
};

export const generateMockShelters = (count: number, center: GeoLocation = DEFAULT_CENTER): Shelter[] => {
  const shelters: Shelter[] = [];
  const locations = [
    "Lincoln High Gym",
    "Madison Sq Arena",
    "Central Park Hub",
    "Brooklyn Public Lib"
  ];

  for (let i = 0; i < count; i++) {
    shelters.push({
      id: `shelter-${i}`,
      name: locations[i % locations.length],
      location: {
        lat: center.lat + (Math.random() - 0.5) * 0.1,
        lng: center.lng + (Math.random() - 0.5) * 0.1
      },
      capacity: 500,
      occupancy: Math.floor(Math.random() * 400)
    });
  }
  return shelters;
};
