import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Bell, 
  Database, 
  Download, 
  Upload, 
  Activity,
  Lock,
  Globe,
  Server,
  AlertTriangle,
  Check,
  X,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

interface SettingsState {
  security: {
    passwordComplexity: boolean;
    twoFactorAuth: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    ipWhitelisting: boolean;
  };
  alerts: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    slackIntegration: boolean;
    alertThreshold: 'low' | 'medium' | 'high' | 'critical';
    realTimeAlerts: boolean;
    digestFrequency: 'hourly' | 'daily' | 'weekly';
  };
  system: {
    dataRetention: number;
    logLevel: 'error' | 'warn' | 'info' | 'debug';
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    maintenanceWindow: string;
    autoUpdates: boolean;
  };
  api: {
    enabled: boolean;
    rateLimit: number;
    keyRotation: boolean;
    corsEnabled: boolean;
  };
}

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('security');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [settings, setSettings] = useState<SettingsState>({
    security: {
      passwordComplexity: true,
      twoFactorAuth: false,
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      ipWhitelisting: false,
    },
    alerts: {
      emailNotifications: true,
      smsNotifications: false,
      slackIntegration: true,
      alertThreshold: 'medium',
      realTimeAlerts: true,
      digestFrequency: 'daily',
    },
    system: {
      dataRetention: 90,
      logLevel: 'info',
      backupFrequency: 'daily',
      maintenanceWindow: '02:00',
      autoUpdates: false,
    },
    api: {
      enabled: true,
      rateLimit: 1000,
      keyRotation: true,
      corsEnabled: false,
    }
  });

  const updateSettings = (section: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // Simulate API call
    setTimeout(() => {
      setHasChanges(false);
      // Show success notification
    }, 1000);
  };

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      // Reset to default values
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'alerts', name: 'Alerts & Notifications', icon: Bell },
    { id: 'system', name: 'System', icon: Server },
    { id: 'api', name: 'API & Integrations', icon: Globe },
  ];

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-cyan-400" />
            Authentication
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Password Complexity</p>
                <p className="text-sm text-gray-400">Enforce strong password requirements</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.passwordComplexity}
                  onChange={(e) => updateSettings('security', 'passwordComplexity', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Require 2FA for all users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorAuth}
                  onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="5"
                max="120"
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="3"
                max="10"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-cyan-400" />
            Access Control
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">IP Whitelisting</p>
                <p className="text-sm text-gray-400">Restrict access to specific IP addresses</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.security.ipWhitelisting}
                  onChange={(e) => updateSettings('security', 'ipWhitelisting', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            {settings.security.ipWhitelisting && (
              <div>
                <label className="block text-white font-medium mb-2">Allowed IP Addresses</label>
                <textarea
                  className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                  rows={4}
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8&#10;172.16.0.0/12"
                />
                <p className="text-xs text-gray-400 mt-1">One IP address or CIDR block per line</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAlertsSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Bell className="h-5 w-5 mr-2 text-cyan-400" />
            Notification Channels
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Send alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.emailNotifications}
                  onChange={(e) => updateSettings('alerts', 'emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-400">Send critical alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.smsNotifications}
                  onChange={(e) => updateSettings('alerts', 'smsNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Slack Integration</p>
                <p className="text-sm text-gray-400">Send alerts to Slack channels</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.slackIntegration}
                  onChange={(e) => updateSettings('alerts', 'slackIntegration', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-cyan-400" />
            Alert Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Minimum Alert Threshold</label>
              <select
                value={settings.alerts.alertThreshold}
                onChange={(e) => updateSettings('alerts', 'alertThreshold', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical Only</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Real-time Alerts</p>
                <p className="text-sm text-gray-400">Send alerts immediately when detected</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.alerts.realTimeAlerts}
                  onChange={(e) => updateSettings('alerts', 'realTimeAlerts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Digest Frequency</label>
              <select
                value={settings.alerts.digestFrequency}
                onChange={(e) => updateSettings('alerts', 'digestFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2 text-cyan-400" />
            Data Management
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Data Retention Period (days)</label>
              <input
                type="number"
                value={settings.system.dataRetention}
                onChange={(e) => updateSettings('system', 'dataRetention', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="30"
                max="365"
              />
              <p className="text-xs text-gray-400 mt-1">Logs older than this will be automatically deleted</p>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Backup Frequency</label>
              <select
                value={settings.system.backupFrequency}
                onChange={(e) => updateSettings('system', 'backupFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>
              <button className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Server className="h-5 w-5 mr-2 text-cyan-400" />
            System Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Log Level</label>
              <select
                value={settings.system.logLevel}
                onChange={(e) => updateSettings('system', 'logLevel', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Maintenance Window</label>
              <input
                type="time"
                value={settings.system.maintenanceWindow}
                onChange={(e) => updateSettings('system', 'maintenanceWindow', e.target.value)}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-xs text-gray-400 mt-1">Daily maintenance window (UTC)</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Automatic Updates</p>
                <p className="text-sm text-gray-400">Install security updates automatically</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.system.autoUpdates}
                  onChange={(e) => updateSettings('system', 'autoUpdates', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-700/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-cyan-400" />
          System Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div>
              <p className="text-green-400 font-medium">Database</p>
              <p className="text-xs text-gray-400">Connected</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div>
              <p className="text-green-400 font-medium">ML Service</p>
              <p className="text-xs text-gray-400">Online</p>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div>
              <p className="text-yellow-400 font-medium">API Gateway</p>
              <p className="text-xs text-gray-400">Rate Limited</p>
            </div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-cyan-400" />
            API Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">API Access</p>
                <p className="text-sm text-gray-400">Enable external API access</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.api.enabled}
                  onChange={(e) => updateSettings('api', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Rate Limit (requests/hour)</label>
              <input
                type="number"
                value={settings.api.rateLimit}
                onChange={(e) => updateSettings('api', 'rateLimit', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                min="100"
                max="10000"
                disabled={!settings.api.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">CORS Support</p>
                <p className="text-sm text-gray-400">Enable cross-origin requests</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.api.corsEnabled}
                  onChange={(e) => updateSettings('api', 'corsEnabled', e.target.checked)}
                  disabled={!settings.api.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 disabled:opacity-50"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Automatic Key Rotation</p>
                <p className="text-sm text-gray-400">Rotate API keys monthly</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.api.keyRotation}
                  onChange={(e) => updateSettings('api', 'keyRotation', e.target.checked)}
                  disabled={!settings.api.enabled}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600 disabled:opacity-50"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-cyan-400" />
            API Keys
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white font-medium mb-2">Current API Key</label>
              <div className="flex items-center space-x-2">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value="sk-ts-1234567890abcdef1234567890abcdef"
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white font-mono text-sm"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-600/50 rounded-lg transition-colors duration-200"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200">
                Regenerate Key
              </button>
              <button className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200">
                Revoke Key
              </button>
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 font-medium text-sm mb-2">API Usage (This Month)</p>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Requests:</span>
                  <span>12,456 / 50,000</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate Limit Hits:</span>
                  <span>23</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'security': return renderSecuritySettings();
      case 'alerts': return renderAlertsSettings();
      case 'system': return renderSystemSettings();
      case 'api': return renderApiSettings();
      default: return renderSecuritySettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">System Settings</h1>
          <p className="text-gray-400 mt-1">Configure system security, alerts, and integrations</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="flex items-center text-sm text-yellow-400">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Unsaved changes
            </span>
          )}
          <button
            onClick={resetSettings}
            className="flex items-center px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl">
        <div className="border-b border-gray-700/50">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};