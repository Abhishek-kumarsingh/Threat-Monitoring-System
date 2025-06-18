import React from 'react';
import { X, AlertTriangle, Shield, Clock } from 'lucide-react';
import { LiveAlert } from '../types';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ open, onClose }) => {
  const mockAlerts: LiveAlert[] = [
    {
      id: '1',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      title: 'Critical Threat Detected',
      message: 'Suspicious activity from IP 192.168.1.100',
      severity: 'critical',
      read: false,
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      title: 'High Risk Connection',
      message: 'Multiple failed login attempts detected',
      severity: 'high',
      read: false,
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      title: 'Security Policy Updated',
      message: 'Firewall rules have been updated',
      severity: 'medium',
      read: true,
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
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

  return (
    <>
      {/* Overlay */}
      {open && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-gray-800/95 backdrop-blur-xl border-l border-gray-700/50 transform transition-transform duration-300 ease-in-out z-50 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <h2 className="text-xl font-semibold text-white">Live Alerts</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border transition-all duration-200 hover:bg-gray-700/30 ${
                  alert.read ? 'opacity-60' : ''
                } ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      {alert.title}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-6 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors duration-200">
            Mark All as Read
          </button>
        </div>
      </div>
    </>
  );
};