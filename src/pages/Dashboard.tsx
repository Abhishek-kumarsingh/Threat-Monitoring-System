import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  TrendingUp,
  Globe,
  Server,
  Clock,
  Users
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DashboardStats, ThreatData } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalThreats: 0,
    blockedThreats: 0,
    activeAlerts: 0,
    riskScore: 0,
  });
  
  const [recentThreats, setRecentThreats] = useState<ThreatData[]>([]);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadData = () => {
      setStats({
        totalThreats: 1247,
        blockedThreats: 1089,
        activeAlerts: 23,
        riskScore: 7.2,
      });

      // Generate mock recent threats
      const mockThreats: ThreatData[] = Array.from({ length: 10 }, (_, i) => ({
        id: `threat-${i}`,
        timestamp: new Date(Date.now() - i * 300000).toISOString(),
        sourceIp: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        destinationIp: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        port: Math.floor(Math.random() * 65535),
        protocol: ['TCP', 'UDP', 'HTTP', 'HTTPS'][Math.floor(Math.random() * 4)],
        threatType: ['Malware', 'DDoS', 'Intrusion', 'Phishing', 'Botnet'][Math.floor(Math.random() * 5)],
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        confidence: Math.floor(Math.random() * 40) + 60,
        details: 'Suspicious network activity detected',
        blocked: Math.random() > 0.3,
      }));
      
      setRecentThreats(mockThreats);
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Mock data for charts
  const threatTimeData = [
    { time: '00:00', threats: 45, blocked: 38 },
    { time: '04:00', threats: 32, blocked: 28 },
    { time: '08:00', threats: 67, blocked: 59 },
    { time: '12:00', threats: 89, blocked: 76 },
    { time: '16:00', threats: 134, blocked: 112 },
    { time: '20:00', threats: 98, blocked: 87 },
  ];

  const threatTypeData = [
    { name: 'Malware', value: 35, color: '#ef4444' },
    { name: 'DDoS', value: 25, color: '#f97316' },
    { name: 'Intrusion', value: 20, color: '#eab308' },
    { name: 'Phishing', value: 15, color: '#22c55e' },
    { name: 'Other', value: 5, color: '#3b82f6' },
  ];

  const topIpsData = [
    { ip: '192.168.1.100', threats: 45 },
    { ip: '10.0.0.23', threats: 38 },
    { ip: '172.16.0.5', threats: 32 },
    { ip: '192.168.0.15', threats: 28 },
    { ip: '10.10.10.10', threats: 24 },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500/30';
      case 'high': return 'bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/30';
      default: return 'bg-green-500/20 border-green-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Security Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time network threat monitoring</p>
        </div>
        <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-sm font-medium">System Online</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Threats</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalThreats.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-red-400 mr-1" />
            <span className="text-red-400">+12%</span>
            <span className="text-gray-400 ml-1">vs last hour</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Blocked Threats</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.blockedThreats.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-green-400">87%</span>
            <span className="text-gray-400 ml-1">success rate</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Alerts</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.activeAlerts}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Activity className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="h-4 w-4 text-orange-400 mr-1" />
            <span className="text-orange-400">5 new</span>
            <span className="text-gray-400 ml-1">in last 5 min</span>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Risk Score</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.riskScore}/10</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Globe className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <div className="w-16 h-2 bg-gray-700 rounded-full mr-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-400 to-yellow-400 rounded-full"
                style={{ width: `${(stats.riskScore / 10) * 100}%` }}
              ></div>
            </div>
            <span className="text-yellow-400 text-xs">Moderate</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Timeline */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Activity (24h)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={threatTimeData}>
              <defs>
                <linearGradient id="threatsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="blockedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="threats"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#threatsGradient)"
                name="Total Threats"
              />
              <Area
                type="monotone"
                dataKey="blocked"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#blockedGradient)"
                name="Blocked"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Threat Types */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Threat Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={threatTypeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {threatTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {threatTypeData.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-300">{item.name} ({item.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Threat Sources */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Top Threat Sources</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topIpsData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9CA3AF" />
              <YAxis dataKey="ip" type="category" stroke="#9CA3AF" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="threats" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Threats */}
        <div className="lg:col-span-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Threat Activity</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentThreats.slice(0, 6).map((threat) => (
              <div key={threat.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getSeverityBg(threat.severity)}`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">{threat.threatType} - {threat.sourceIp}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(threat.timestamp).toLocaleTimeString()} • {threat.protocol}:{threat.port}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    threat.blocked ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {threat.blocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};