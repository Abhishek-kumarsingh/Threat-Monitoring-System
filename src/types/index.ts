export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: string;
  lastLogin?: string;
}

export interface ThreatData {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  port: number;
  protocol: string;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  details: string;
  blocked: boolean;
}

export interface LiveAlert {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
}

export interface DashboardStats {
  totalThreats: number;
  blockedThreats: number;
  activeAlerts: number;
  riskScore: number;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}