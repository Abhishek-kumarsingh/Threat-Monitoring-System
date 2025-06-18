import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest,
  LogEntry,
  ThreatPrediction,
  LiveAlert,
  PaginatedResponse,
  ApiResponse,
  DashboardStats,
  ThreatType,
  ThreatSeverity,
  AlertStatus
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<string> {
    const response = await this.api.post<string>('/auth/register', userData);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<User>('/auth/me');
    return response.data;
  }

  // Log Entry APIs
  async uploadCsvFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.api.post<string>('/logs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getLogEntries(page = 0, size = 20): Promise<PaginatedResponse<LogEntry>> {
    const response = await this.api.get<PaginatedResponse<LogEntry>>('/logs', {
      params: { page, size, sort: 'timestamp,desc' }
    });
    return response.data;
  }

  async getLogEntriesByDateRange(
    startDate: string, 
    endDate: string, 
    page = 0, 
    size = 20
  ): Promise<PaginatedResponse<LogEntry>> {
    const response = await this.api.get<PaginatedResponse<LogEntry>>('/logs/date-range', {
      params: { startDate, endDate, page, size, sort: 'timestamp,desc' }
    });
    return response.data;
  }

  async getLogEntriesBySourceIp(sourceIp: string): Promise<LogEntry[]> {
    const response = await this.api.get<LogEntry[]>(`/logs/source-ip/${sourceIp}`);
    return response.data;
  }

  async getTopSourceIps(startDate: string, endDate: string, limit = 10): Promise<Array<[string, number]>> {
    const response = await this.api.get<Array<[string, number]>>('/logs/stats/top-source-ips', {
      params: { startDate, endDate, size: limit }
    });
    return response.data;
  }

  async getProtocolDistribution(startDate: string, endDate: string): Promise<Array<[string, number]>> {
    const response = await this.api.get<Array<[string, number]>>('/logs/stats/protocol-distribution', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getLogCount(startDate: string, endDate: string): Promise<number> {
    const response = await this.api.get<number>('/logs/stats/count', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Threat Prediction APIs
  async getThreatPredictions(page = 0, size = 20): Promise<PaginatedResponse<ThreatPrediction>> {
    const response = await this.api.get<PaginatedResponse<ThreatPrediction>>('/threats', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getThreatPredictionById(id: number): Promise<ThreatPrediction> {
    const response = await this.api.get<ThreatPrediction>(`/threats/${id}`);
    return response.data;
  }

  async getThreatPredictionsByType(
    threatType: ThreatType, 
    page = 0, 
    size = 20
  ): Promise<PaginatedResponse<ThreatPrediction>> {
    const response = await this.api.get<PaginatedResponse<ThreatPrediction>>(`/threats/type/${threatType}`, {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getThreatPredictionsBySeverity(
    severity: ThreatSeverity, 
    page = 0, 
    size = 20
  ): Promise<PaginatedResponse<ThreatPrediction>> {
    const response = await this.api.get<PaginatedResponse<ThreatPrediction>>(`/threats/severity/${severity}`, {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getRecentThreats(confidenceThreshold = 0.7, limit = 10): Promise<ThreatPrediction[]> {
    const response = await this.api.get<ThreatPrediction[]>('/threats/recent', {
      params: { confidenceThreshold, size: limit }
    });
    return response.data;
  }

  async getThreatTypeDistribution(startDate: string, endDate: string): Promise<Array<[string, number]>> {
    const response = await this.api.get<Array<[string, number]>>('/threats/stats/threat-type-distribution', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async getSeverityDistribution(startDate: string, endDate: string): Promise<Array<[string, number]>> {
    const response = await this.api.get<Array<[string, number]>>('/threats/stats/severity-distribution', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  async markThreatAsFalsePositive(id: number, notes?: string): Promise<ThreatPrediction> {
    const response = await this.api.put<ThreatPrediction>(`/threats/${id}/false-positive`, notes);
    return response.data;
  }

  async updateThreatNotes(id: number, notes: string): Promise<ThreatPrediction> {
    const response = await this.api.put<ThreatPrediction>(`/threats/${id}/notes`, notes);
    return response.data;
  }

  // Live Alert APIs
  async getLiveAlerts(page = 0, size = 20): Promise<PaginatedResponse<LiveAlert>> {
    const response = await this.api.get<PaginatedResponse<LiveAlert>>('/alerts', {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getAlertById(id: number): Promise<LiveAlert> {
    const response = await this.api.get<LiveAlert>(`/alerts/${id}`);
    return response.data;
  }

  async getAlertsByStatus(status: AlertStatus, page = 0, size = 20): Promise<PaginatedResponse<LiveAlert>> {
    const response = await this.api.get<PaginatedResponse<LiveAlert>>(`/alerts/status/${status}`, {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  }

  async getActiveAlerts(limit = 10): Promise<LiveAlert[]> {
    const response = await this.api.get<LiveAlert[]>('/alerts/active', {
      params: { size: limit }
    });
    return response.data;
  }

  async acknowledgeAlert(id: number, notes?: string): Promise<LiveAlert> {
    const response = await this.api.put<LiveAlert>(`/alerts/${id}/acknowledge`, notes);
    return response.data;
  }

  async resolveAlert(id: number, resolutionNotes: string): Promise<LiveAlert> {
    const response = await this.api.put<LiveAlert>(`/alerts/${id}/resolve`, resolutionNotes);
    return response.data;
  }

  async createCustomAlert(
    title: string, 
    message: string, 
    severity: ThreatSeverity, 
    sourceIp?: string
  ): Promise<LiveAlert> {
    const response = await this.api.post<LiveAlert>('/alerts/custom', null, {
      params: { title, message, severity, sourceIp }
    });
    return response.data;
  }

  async getAlertCountByStatus(status: AlertStatus): Promise<number> {
    const response = await this.api.get<number>(`/alerts/stats/count/${status}`);
    return response.data;
  }

  async getActiveAlertCountBySeverity(severity: ThreatSeverity): Promise<number> {
    const response = await this.api.get<number>(`/alerts/stats/active-count/${severity}`);
    return response.data;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const [
      activeAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      recentThreats,
      totalLogEntries
    ] = await Promise.all([
      this.getAlertCountByStatus('ACTIVE'),
      this.getActiveAlertCountBySeverity('CRITICAL'),
      this.getActiveAlertCountBySeverity('HIGH'),
      this.getActiveAlertCountBySeverity('MEDIUM'),
      this.getActiveAlertCountBySeverity('LOW'),
      this.getRecentThreats(0.7, 5),
      this.getLogCount(last24Hours.toISOString(), now.toISOString())
    ]);

    const totalThreats = recentThreats.filter(t => t.threatType !== 'NORMAL').length;
    const blockedThreats = recentThreats.filter(t => 
      t.threatType !== 'NORMAL' && t.confidenceScore > 0.8
    ).length;

    // Calculate risk score based on active alerts and threat severity
    const riskScore = Math.min(100, 
      (criticalAlerts * 25) + 
      (highAlerts * 15) + 
      (mediumAlerts * 10) + 
      (lowAlerts * 5)
    );

    return {
      totalThreats,
      blockedThreats,
      activeAlerts,
      criticalAlerts,
      highAlerts,
      mediumAlerts,
      lowAlerts,
      riskScore,
      totalLogEntries,
      recentThreats
    };
  }
}

export const apiService = new ApiService();
export default apiService;
