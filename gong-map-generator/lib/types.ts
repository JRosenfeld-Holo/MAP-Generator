export interface GongCall {
  id: string;
  title: string;
  started: string;
  duration: number;
  parties: GongParty[];
  scope?: string;
}

export interface GongParty {
  emailAddress?: string;
  name?: string;
  affiliation?: 'Internal' | 'External';
  speakerId?: string;
}

export interface GongAccount {
  name: string;
  email: string;
  callIds: string[];
  latestCallDate: string;
  dealStage: string;
}

export interface TranscriptEntry {
  speakerId: string;
  topic?: string;
  sentences: { start: number; end: number; text: string }[];
}

export interface GongTranscript {
  callId: string;
  transcript: TranscriptEntry[];
}

export interface MAPMilestone {
  title: string;
  description: string;
  owner: 'Hologram' | 'Customer' | 'Joint';
  targetDate: string;
  status: 'pending' | 'in_progress' | 'complete';
}

export interface MAPRiskFactor {
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface MAPContent {
  northStar: string;
  milestones: MAPMilestone[];
  riskFactors: MAPRiskFactor[];
  successFactors: string[];
  stakeholders: { name: string; role: string; company: string }[];
  customerName: string;
  aeName: string;
  dealStage: string;
  generatedAt: string;
}

export interface MutualActionPlan {
  id: string;
  created_at: string;
  customer_name: string;
  gong_call_id: string;
  slug: string;
  content: MAPContent;
  is_published: boolean;
}
