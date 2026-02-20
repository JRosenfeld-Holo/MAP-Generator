import { ActionItem, ActionStatus, ActionCategory, RequirementItem } from './types';

export const INITIAL_ACTIONS: ActionItem[] = [
  // Immediate Actions
  {
    id: '1',
    task: 'Send test samples (QR Code/embedded chips)',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.IMMEDIATE,
    dueDate: 'Week 1'
  },
  {
    id: '2',
    task: 'Request shipping address for test SIMs',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.IMMEDIATE,
    dueDate: 'Tomorrow'
  },
  {
    id: '3',
    task: 'Provide shipping address',
    owner: 'Rhine',
    status: ActionStatus.PENDING,
    category: ActionCategory.IMMEDIATE,
    dueDate: 'In 2 Days'
  },
  // Technical Validation
  {
    id: '4',
    task: 'Schedule engineering call for prototype testing',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.TECHNICAL,
    dueDate: 'Week 2'
  },
  {
    id: '5',
    task: 'Confirm native AT command support for SIM',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.COMPLETE,
    category: ActionCategory.TECHNICAL,
    dueDate: 'Done'
  },
  {
    id: '6',
    task: 'Test profile download process with team',
    owner: 'Rhine + Eng Team',
    status: ActionStatus.PENDING,
    category: ActionCategory.TECHNICAL,
    dueDate: 'Next 7 Days'
  },
  {
    id: '7',
    task: 'Validate data usage and SMS functionality',
    owner: 'Both Teams',
    status: ActionStatus.PENDING,
    category: ActionCategory.TECHNICAL,
    dueDate: 'Next 10 Days'
  },
  // Commercial & Compliance
  {
    id: '8',
    task: 'Verify integration with Indian state government portals',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.COMMERCIAL,
    dueDate: 'Week 3'
  },
  {
    id: '9',
    task: 'Research 2G operator pricing (Airtel, Vodafone)',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.COMMERCIAL,
    dueDate: 'Next 5 Days'
  },
  {
    id: '10',
    task: 'Adjust hardware costs for MFF2 embedded chip',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.COMMERCIAL,
    dueDate: 'Next 5 Days'
  },
  {
    id: '11',
    task: 'Deliver revised commercial proposal',
    owner: 'Nicholas (Hologram)',
    status: ActionStatus.PENDING,
    category: ActionCategory.COMMERCIAL,
    dueDate: 'Next 5 Days'
  },
  {
    id: '12',
    task: 'Review and provide feedback on proposal',
    owner: 'Rhine',
    status: ActionStatus.PENDING,
    category: ActionCategory.COMMERCIAL,
    dueDate: 'Next 10 Days'
  }
];

export const REQUIREMENTS: RequirementItem[] = [
  { category: 'Data Usage', details: '150 MB per profile/month' },
  { category: 'SMS', details: '300 SMS/month for device commands' },
  { category: 'Network', details: '2G-only device support' },
  { category: 'Coverage', details: 'India (Airtel Pref) & Nepal (Ncell)' },
  { category: 'Compliance', details: 'AIS norms & State registration' },
  { category: 'Hardware', details: 'MFF2 embedded chip format' },
];