import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  AlertTriangle, 
  Shield, 
  Clock,
  Eye,
  Ban
} from 'lucide-react';
import { ThreatData } from '../types';

export const Threats: React.FC = () => {
  const [threats, setThreats] = useState<ThreatData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    // Generate mock threat data
    const generateMockThreats = (): ThreatData[] => {
      const threatTypes = ['Malware', 'DDoS', 'Intrusion', 'Phishing', 'Botnet', 'Ransomware'];
      const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
      const protocols = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'FTP', 'SSH'];
      
      return Array.from({ length: 50 }, (_, i) => ({
        id: `threat-${i}`,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
        sourceIp: `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        destinationIp: `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
        port: Math.floor(Math.random() * 65535) + 1,
        protocol: protocols[Math.floor(Math.random() * protocols.length)],
        threatType: threatTypes[Math.floor(Math.random() * threatTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        confidence: Math.floor(Math.random() * 40) + 60,
        details: `Suspicious ${protocols[Math.floor(Math.random() * protocols.length)]} activity detected from external source`,
        blocked: Math.random() > 0.3,
      }));
    };

    setThreats(generateMockThreats());
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border border-yellow-500/30';
      default: return 'text-green-400 bg-green-500/20 border border-green-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Shield className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredThreats = threats
    .filter(threat => {
      const matchesSearch = threat.sourceIp.includes(searchTerm) || 
                          threat.threatType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          threat.destinationIp.includes(searchTerm);
      const matchesSeverity = severityFilter === 'all' || threat.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp).getTime();
          bValue = new Date(b.timestamp).getTime();
          break;
        case 'severity':
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
          break;
        default:
          aValue = a[sortBy as keyof ThreatData];
          bValue = b[sortBy as keyof ThreatData];
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const exportThreats = () => {
    const csv = [
      ['Timestamp', 'Source IP', 'Destination IP', 'Port', 'Protocol', 'Threat Type', 'Severity', 'Confidence', 'Blocked', 'Details'],
      ...filteredThreats.map(threat => [
        threat.timestamp,
        threat.sourceIp,
        threat.destinationIp,
        threat.port,
        threat.protocol,
        threat.threatType,
        threat.severity,
        threat.confidence,
        threat.blocked ? 'Yes' : 'No',
        threat.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `threats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Threat Analysis</h1>
          <p className="text-gray-400 mt-1">Monitor and analyze network security threats</p>
        </div>
        <button
          onClick={exportThreats}
          className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200"
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by IP, threat type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="timestamp">Sort by Time</option>
            <option value="severity">Sort by Severity</option>
            <option value="confidence">Sort by Confidence</option>
            <option value="threatType">Sort by Type</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Threats</p>
              <p className="text-xl font-bold text-white">{filteredThreats.length}</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Blocked</p>
              <p className="text-xl font-bold text-white">
                {filteredThreats.filter(t => t.blocked).length}
              </p>
            </div>
            <Shield className="h-5 w-5 text-green-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical</p>
              <p className="text-xl font-bold text-white">
                {filteredThreats.filter(t => t.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Confidence</p>
              <p className="text-xl font-bold text-white">
                {Math.round(filteredThreats.reduce((acc, t) => acc + t.confidence, 0) / filteredThreats.length || 0)}%
              </p>
            </div>
            <Eye className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Threats Table */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50 border-b border-gray-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Threat
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Confidence
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {filteredThreats.slice(0, 20).map((threat) => (
                <tr key={threat.id} className="hover:bg-gray-700/30 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getSeverityIcon(threat.severity)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">{threat.threatType}</div>
                        <div className="text-sm text-gray-400">{threat.protocol}:{threat.port}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-mono">{threat.sourceIp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white font-mono">{threat.destinationIp}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(threat.severity)}`}>
                      {threat.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-white">{threat.confidence}%</div>
                      <div className="ml-2 w-16 h-2 bg-gray-700 rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-red-500 to-green-500 rounded-full"
                          style={{ width: `${threat.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {threat.blocked ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                        <Ban className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(threat.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};