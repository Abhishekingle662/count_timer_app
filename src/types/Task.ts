export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  estimatedDuration: number; // in minutes
  requiresLocation?: boolean;
  requiredLocation?: {
    latitude: number;
    longitude: number;
    radius: number; // in meters
    name: string;
  };
  proofType: 'photo' | 'video' | 'document' | 'location' | 'combination';
  status: 'pending' | 'active' | 'completed' | 'failed' | 'overdue';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // in seconds
  proofSubmitted?: ProofSubmission[];
  emergencyContacts?: string[];
  blockedApps?: string[];
}

export interface ProofSubmission {
  id: string;
  type: 'photo' | 'video' | 'document' | 'location';
  uri?: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: Date;
  };
  timestamp: Date;
  verified: boolean;
  aiAnalysis?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  estimatedDuration: number;
  proofType: 'photo' | 'video' | 'document' | 'location' | 'combination';
  requiresLocation: boolean;
  blockedApps: string[];
}