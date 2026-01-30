
export type AssetCategory = 'medical' | 'rescue' | 'ndrf';

export interface EmergencyContactInfo {
  title: string;
  primary: string;
  secondary: string;
  primaryLabel: string;
  secondaryLabel: string;
  description: string;
}

export const EMERGENCY_CONTACTS: Record<AssetCategory, EmergencyContactInfo> = {
  medical: {
    title: 'Medical Deployment (Ambulance)',
    primary: '102',
    secondary: '108',
    primaryLabel: 'National Ambulance Service',
    secondaryLabel: 'Emergency Response Service',
    description: 'Dispatch for ground medical evacuation and immediate life support.'
  },
  rescue: {
    title: 'Maritime Rescue (Rescue Boat)',
    primary: '1554',
    secondary: '1718',
    primaryLabel: 'Maritime SAR Hotline',
    secondaryLabel: 'Indian Coast Guard',
    description: 'Aeronautical and maritime search and rescue coordination center.'
  },
  ndrf: {
    title: 'NDRF Specialist Force',
    primary: '9711077372',
    secondary: '011-24363260',
    primaryLabel: '24/7 Distress Helpline',
    secondaryLabel: 'NDRF HQ Command',
    description: 'Specialized response to natural and man-made disasters.'
  }
};
