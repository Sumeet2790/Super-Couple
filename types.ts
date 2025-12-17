
export interface CoupleProfile {
  partner1Name: string;
  partner2Name: string;
  anniversaryDate: string; // ISO string
  onboarded: boolean;
  xp: number;
  coupleId: string; // Shared identifier for syncing
  lastSyncedAt?: string; // ISO string
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'fun' | 'deep' | 'romantic' | 'adventurous';
  xpReward: number;
  isCompleted: boolean;
  dateGenerated: string; // ISO string YYYY-MM-DD
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  isAchieved: boolean;
  icon: string;
}

export interface DateIdea {
  title: string;
  description: string;
  estimatedCost: string;
  duration: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  MILESTONES = 'MILESTONES',
  AI_PLANNER = 'AI_PLANNER',
  LEADERBOARD = 'LEADERBOARD',
  PROFILE = 'PROFILE'
}
