import SockJS from 'sockjs-client';
import { Stomp, Client } from 'stompjs';
import { LiveAlert } from '../types';

export type AlertCallback = (alert: LiveAlert) => void;
export type AlertUpdateCallback = (alert: LiveAlert) => void;

class WebSocketService {
  private client: Client | null = null;
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private alertCallbacks: AlertCallback[] = [];
  private alertUpdateCallbacks: AlertUpdateCallback[] = [];

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';
      const socket = new SockJS(wsUrl);
      this.client = Stomp.over(socket);

      // Disable debug logging in production
      if (import.meta.env.PROD) {
        this.client.debug = () => {};
      }

      this.client.connect(
        {},
        this.onConnect.bind(this),
        this.onError.bind(this)
      );
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  private onConnect() {
    console.log('WebSocket connected');
    this.connected = true;
    this.reconnectAttempts = 0;

    // Subscribe to alert topics
    this.subscribeToAlerts();
  }

  private onError(error: any) {
    console.error('WebSocket error:', error);
    this.connected = false;
    this.scheduleReconnect();
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached. WebSocket connection failed.');
    }
  }

  private subscribeToAlerts() {
    if (!this.client || !this.connected) {
      return;
    }

    // Subscribe to all alerts
    this.client.subscribe('/topic/alerts', (message) => {
      try {
        const alert: LiveAlert = JSON.parse(message.body);
        this.notifyAlertCallbacks(alert);
      } catch (error) {
        console.error('Error parsing alert message:', error);
      }
    });

    // Subscribe to alert updates
    this.client.subscribe('/topic/alerts/updates', (message) => {
      try {
        const alert: LiveAlert = JSON.parse(message.body);
        this.notifyAlertUpdateCallbacks(alert);
      } catch (error) {
        console.error('Error parsing alert update message:', error);
      }
    });

    // Subscribe to critical alerts
    this.client.subscribe('/topic/alerts/critical', (message) => {
      try {
        const alert: LiveAlert = JSON.parse(message.body);
        this.notifyAlertCallbacks(alert);
        // Show browser notification for critical alerts
        this.showBrowserNotification(alert);
      } catch (error) {
        console.error('Error parsing critical alert message:', error);
      }
    });

    // Subscribe to high severity alerts
    this.client.subscribe('/topic/alerts/high', (message) => {
      try {
        const alert: LiveAlert = JSON.parse(message.body);
        this.notifyAlertCallbacks(alert);
      } catch (error) {
        console.error('Error parsing high severity alert message:', error);
      }
    });
  }

  private notifyAlertCallbacks(alert: LiveAlert) {
    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  private notifyAlertUpdateCallbacks(alert: LiveAlert) {
    this.alertUpdateCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert update callback:', error);
      }
    });
  }

  private showBrowserNotification(alert: LiveAlert) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(`${alert.severity} Alert: ${alert.title}`, {
        body: alert.message,
        icon: '/shield.svg',
        badge: '/shield.svg',
        tag: `alert-${alert.id}`,
        requireInteraction: alert.severity === 'CRITICAL',
      });

      notification.onclick = () => {
        window.focus();
        // Navigate to alerts page or specific alert
        window.location.hash = `#/alerts/${alert.id}`;
        notification.close();
      };

      // Auto-close after 10 seconds for non-critical alerts
      if (alert.severity !== 'CRITICAL') {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }
    }
  }

  public onAlert(callback: AlertCallback): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  public onAlertUpdate(callback: AlertUpdateCallback): () => void {
    this.alertUpdateCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertUpdateCallbacks.splice(index, 1);
      }
    };
  }

  public requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      });
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public disconnect() {
    if (this.client && this.connected) {
      this.client.disconnect(() => {
        console.log('WebSocket disconnected');
      });
      this.connected = false;
    }
  }

  public reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
