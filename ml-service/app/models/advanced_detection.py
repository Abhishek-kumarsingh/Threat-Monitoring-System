# New file for advanced detection methods
from typing import Dict, List, Any
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import networkx as nx

class BehavioralAnalyzer:
    """Analyzes entity behavior patterns over time"""
    
    def __init__(self):
        self.entity_profiles = {}
        self.time_window = timedelta(hours=24)
    
    def update_profile(self, entity_id: str, activity_data: Dict[str, Any]):
        """Update behavioral profile for an entity"""
        if entity_id not in self.entity_profiles:
            self.entity_profiles[entity_id] = {
                'activities': [],
                'last_updated': datetime.now()
            }
        
        # Add new activity with timestamp
        activity_data['timestamp'] = datetime.now()
        self.entity_profiles[entity_id]['activities'].append(activity_data)
        self.entity_profiles[entity_id]['last_updated'] = datetime.now()
        
        # Prune old activities
        self._prune_old_activities(entity_id)
    
    def _prune_old_activities(self, entity_id: str):
        """Remove activities outside the time window"""
        if entity_id in self.entity_profiles:
            cutoff_time = datetime.now() - self.time_window
            self.entity_profiles[entity_id]['activities'] = [
                activity for activity in self.entity_profiles[entity_id]['activities']
                if activity['timestamp'] > cutoff_time
            ]
    
    def detect_anomalies(self, entity_id: str, current_activity: Dict[str, Any]) -> Dict[str, Any]:
        """Detect anomalies by comparing current activity to historical profile"""
        if entity_id not in self.entity_profiles or not self.entity_profiles[entity_id]['activities']:
            return {'is_anomalous': False, 'anomaly_score': 0.0, 'reason': 'Insufficient history'}
        
        # Extract relevant features for comparison
        profile = self.entity_profiles[entity_id]['activities']
        
        # Example: Check if current destination is unusual
        usual_destinations = set(a.get('destination_ip') for a in profile if 'destination_ip' in a)
        current_destination = current_activity.get('destination_ip')
        
        # Example: Check if current time is unusual
        usual_hours = [a['timestamp'].hour for a in profile if 'timestamp' in a]
        current_hour = datetime.now().hour
        
        # Simple anomaly detection
        anomalies = []
        anomaly_score = 0.0
        
        if current_destination and current_destination not in usual_destinations:
            anomalies.append(f"Unusual destination: {current_destination}")
            anomaly_score += 0.5
        
        if current_hour not in usual_hours:
            anomalies.append(f"Unusual activity time: {current_hour}:00")
            anomaly_score += 0.3
        
        return {
            'is_anomalous': len(anomalies) > 0,
            'anomaly_score': min(anomaly_score, 1.0),
            'anomalies': anomalies
        }

class NetworkGraphAnalyzer:
    """Analyzes network connections using graph theory"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.suspicious_patterns = [
            {'name': 'hub_and_spoke', 'threshold': 10},
            {'name': 'isolated_cluster', 'threshold': 3},
            {'name': 'chain_forwarding', 'threshold': 4}
        ]
    
    def add_connection(self, source: str, destination: str, metadata: Dict[str, Any] = None):
        """Add a connection to the network graph"""
        if not self.graph.has_node(source):
            self.graph.add_node(source, type='source', first_seen=datetime.now())
        
        if not self.graph.has_node(destination):
            self.graph.add_node(destination, type='destination', first_seen=datetime.now())
        
        # Add or update edge
        if self.graph.has_edge(source, destination):
            # Update existing edge
            self.graph[source][destination]['weight'] += 1
            self.graph[source][destination]['last_seen'] = datetime.now()
        else:
            # Add new edge
            self.graph.add_edge(
                source, destination,
                weight=1,
                first_seen=datetime.now(),
                last_seen=datetime.now(),
                metadata=metadata or {}
            )
    
    def detect_suspicious_patterns(self) -> List[Dict[str, Any]]:
        """Detect suspicious patterns in the network graph"""
        findings = []
        
        # Detect hub pattern (many outgoing connections)
        for node in self.graph.nodes():
            out_degree = self.graph.out_degree(node, weight='weight')
            if out_degree > self.suspicious_patterns[0]['threshold']:
                findings.append({
                    'pattern': 'hub_and_spoke',
                    'node': node,
                    'connections': out_degree,
                    'risk_score': min(out_degree / 20, 1.0) * 100
                })
        
        # More pattern detection can be added here
        
        return findings