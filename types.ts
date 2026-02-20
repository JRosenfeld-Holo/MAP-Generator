export enum ActionStatus {
  PENDING = 'Pending',
  COMPLETE = 'Complete'
}

export enum ActionCategory {
  IMMEDIATE = 'Immediate Actions',
  TECHNICAL = 'Technical Validation',
  COMMERCIAL = 'Commercial & Compliance'
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  status: ActionStatus;
  category: ActionCategory;
  dueDate: string; // Display string like "This Week" or "Next 7 Days"
}

export interface RequirementItem {
  category: string;
  details: string;
}