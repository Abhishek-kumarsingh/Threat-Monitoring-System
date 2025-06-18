export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'ANALYST' | 'VIEWER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface LogEntry {
  id: number;
  sourceIp: string;
  destinationIp?: string;
  sourcePort?: number;
  destinationPort?: number;
  protocol?: string;
  packetSize?: number;
  timestamp: string;
  action?: string;
  bytesSent?: number;
  bytesReceived?: number;
  duration?: number;
  userAgent?: string;
  requestMethod?: string;
  requestUrl?: string;
  responseCode?: number;
  country?: string;
  region?: string;
  city?: string;
  uploadedBy: number;
  uploadedAt: string;
  fileName?: string;
}

export interface ThreatPrediction {
  id: number;
  logEntry: LogEntry;
  threatType: ThreatType;
  severity: ThreatSeverity;
  confidenceScore: number;
  riskScore: number;
  description: string;
  recommendedAction: string;
  isFalsePositive: boolean;
  analystNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  modelVersion: string;
  processingTimeMs: number;
}

export interface LiveAlert {
  id: number;
  threatPrediction?: ThreatPrediction;
  title: string;
  message: string;
  severity: ThreatSeverity;
  status: AlertStatus;
  sourceIp?: string;
  affectedSystems?: string;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: number;
  resolvedBy?: number;
  resolutionNotes?: string;
}

export type ThreatType =
  | 'MALWARE'
  | 'PHISHING'
  | 'DDoS'
  | 'BRUTE_FORCE'
  | 'SQL_INJECTION'
  | 'XSS'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_EXFILTRATION'
  | 'UNAUTHORIZED_ACCESS'
  | 'PORT_SCAN'
  | 'BOTNET'
  | 'RANSOMWARE'
  | 'INSIDER_THREAT'
  | 'APT'
  | 'NORMAL';

export type ThreatSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_POSITIVE';

export interface DashboardStats {
  totalThreats: number;
  blockedThreats: number;
  activeAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  riskScore: number;
  totalLogEntries: number;
  recentThreats: ThreatPrediction[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  email: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  category?: string;
}