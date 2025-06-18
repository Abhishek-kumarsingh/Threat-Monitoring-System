import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime
import ipaddress
import re

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.feature_columns = [
            'source_ip', 'destination_ip', 'source_port', 'destination_port',
            'protocol', 'packet_size', 'bytes_sent', 'bytes_received',
            'duration', 'user_agent', 'request_method', 'request_url',
            'response_code', 'country', 'region', 'city'
        ]
    
    def process_single_entry(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process a single log entry"""
        try:
            processed = {}
            
            # Copy basic fields
            for field in self.feature_columns:
                processed[field] = data.get(field)
            
            # Add derived features
            processed.update(self._extract_derived_features(data))
            
            # Clean and validate data
            processed = self._clean_data(processed)
            
            return processed
            
        except Exception as e:
            logger.error(f"Error processing single entry: {str(e)}")
            raise e
    
    def process_batch(self, data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Process multiple log entries"""
        processed_list = []
        
        for data in data_list:
            try:
                processed = self.process_single_entry(data)
                processed_list.append(processed)
            except Exception as e:
                logger.error(f"Error processing batch entry: {str(e)}")
                # Add a default processed entry for failed ones
                processed_list.append(self._get_default_entry())
        
        return processed_list
    
    def process_csv_data(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Process CSV data into list of dictionaries"""
        try:
            # Clean column names
            df.columns = df.columns.str.lower().str.replace(' ', '_')
            
            # Convert to list of dictionaries
            data_list = df.to_dict('records')
            
            # Process each entry
            return self.process_batch(data_list)
            
        except Exception as e:
            logger.error(f"Error processing CSV data: {str(e)}")
            raise e
    
    def _extract_derived_features(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract derived features from raw data"""
        derived = {}
        
        try:
            # IP-based features
            source_ip = data.get('source_ip')
            if source_ip:
                derived.update(self._extract_ip_features(source_ip, 'source'))
            
            destination_ip = data.get('destination_ip')
            if destination_ip:
                derived.update(self._extract_ip_features(destination_ip, 'destination'))
            
            # Port-based features
            source_port = data.get('source_port')
            destination_port = data.get('destination_port')
            if source_port and destination_port:
                derived.update(self._extract_port_features(source_port, destination_port))
            
            # URL-based features
            request_url = data.get('request_url')
            if request_url:
                derived.update(self._extract_url_features(request_url))
            
            # User agent features
            user_agent = data.get('user_agent')
            if user_agent:
                derived.update(self._extract_user_agent_features(user_agent))
            
            # Time-based features (mock for now since we don't have timestamp)
            derived.update(self._extract_time_features())
            
            # Traffic pattern features
            derived.update(self._extract_traffic_features(data))
            
        except Exception as e:
            logger.error(f"Error extracting derived features: {str(e)}")
        
        return derived
    
    def _extract_ip_features(self, ip: str, prefix: str) -> Dict[str, Any]:
        """Extract features from IP address"""
        features = {}
        
        try:
            ip_obj = ipaddress.ip_address(ip)
            
            # IP type features
            features[f'{prefix}_is_private'] = ip_obj.is_private
            features[f'{prefix}_is_multicast'] = ip_obj.is_multicast
            features[f'{prefix}_is_loopback'] = ip_obj.is_loopback
            
            # IP range features
            if isinstance(ip_obj, ipaddress.IPv4Address):
                features[f'{prefix}_is_ipv4'] = True
                features[f'{prefix}_is_ipv6'] = False
                # Extract octets for IPv4
                octets = str(ip_obj).split('.')
                features[f'{prefix}_first_octet'] = int(octets[0])
                features[f'{prefix}_second_octet'] = int(octets[1])
            else:
                features[f'{prefix}_is_ipv4'] = False
                features[f'{prefix}_is_ipv6'] = True
                features[f'{prefix}_first_octet'] = 0
                features[f'{prefix}_second_octet'] = 0
                
        except Exception as e:
            logger.error(f"Error extracting IP features for {ip}: {str(e)}")
            # Default values
            features[f'{prefix}_is_private'] = False
            features[f'{prefix}_is_multicast'] = False
            features[f'{prefix}_is_loopback'] = False
            features[f'{prefix}_is_ipv4'] = True
            features[f'{prefix}_is_ipv6'] = False
            features[f'{prefix}_first_octet'] = 0
            features[f'{prefix}_second_octet'] = 0
        
        return features
    
    def _extract_port_features(self, source_port: int, destination_port: int) -> Dict[str, Any]:
        """Extract features from port numbers"""
        features = {}
        
        # Well-known ports
        well_known_ports = {80, 443, 21, 22, 23, 25, 53, 110, 143, 993, 995}
        
        features['source_port_is_well_known'] = source_port in well_known_ports
        features['dest_port_is_well_known'] = destination_port in well_known_ports
        
        # Port ranges
        features['source_port_is_system'] = source_port < 1024
        features['dest_port_is_system'] = destination_port < 1024
        features['source_port_is_dynamic'] = source_port >= 49152
        features['dest_port_is_dynamic'] = destination_port >= 49152
        
        # Port difference
        features['port_difference'] = abs(source_port - destination_port)
        
        return features
    
    def _extract_url_features(self, url: str) -> Dict[str, Any]:
        """Extract features from URL"""
        features = {}
        
        try:
            # URL length
            features['url_length'] = len(url)
            
            # Special characters count
            features['url_special_chars'] = len(re.findall(r'[^a-zA-Z0-9/._-]', url))
            
            # Path depth
            features['url_path_depth'] = url.count('/')
            
            # Query parameters
            features['url_has_query'] = '?' in url
            features['url_query_params'] = url.count('&') + (1 if '?' in url else 0)
            
            # Suspicious patterns
            suspicious_patterns = ['script', 'eval', 'exec', 'cmd', 'shell', 'admin', 'login']
            features['url_suspicious_keywords'] = sum(1 for pattern in suspicious_patterns if pattern in url.lower())
            
        except Exception as e:
            logger.error(f"Error extracting URL features: {str(e)}")
            features = {
                'url_length': 0,
                'url_special_chars': 0,
                'url_path_depth': 0,
                'url_has_query': False,
                'url_query_params': 0,
                'url_suspicious_keywords': 0
            }
        
        return features
    
    def _extract_user_agent_features(self, user_agent: str) -> Dict[str, Any]:
        """Extract features from user agent string"""
        features = {}
        
        try:
            ua_lower = user_agent.lower()
            
            # Browser detection
            browsers = ['chrome', 'firefox', 'safari', 'edge', 'opera']
            features['ua_browser_detected'] = any(browser in ua_lower for browser in browsers)
            
            # OS detection
            os_list = ['windows', 'mac', 'linux', 'android', 'ios']
            features['ua_os_detected'] = any(os in ua_lower for os in os_list)
            
            # Bot detection
            bot_indicators = ['bot', 'crawler', 'spider', 'scraper']
            features['ua_is_bot'] = any(indicator in ua_lower for indicator in bot_indicators)
            
            # User agent length
            features['ua_length'] = len(user_agent)
            
            # Suspicious patterns
            features['ua_is_suspicious'] = len(user_agent) < 10 or len(user_agent) > 500
            
        except Exception as e:
            logger.error(f"Error extracting user agent features: {str(e)}")
            features = {
                'ua_browser_detected': False,
                'ua_os_detected': False,
                'ua_is_bot': False,
                'ua_length': 0,
                'ua_is_suspicious': False
            }
        
        return features
    
    def _extract_time_features(self) -> Dict[str, Any]:
        """Extract time-based features (mock implementation)"""
        # In a real implementation, you'd extract these from actual timestamps
        now = datetime.now()
        
        return {
            'hour_of_day': now.hour,
            'day_of_week': now.weekday(),
            'is_weekend': now.weekday() >= 5,
            'is_business_hours': 9 <= now.hour <= 17
        }
    
    def _extract_traffic_features(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract traffic pattern features"""
        features = {}
        
        try:
            bytes_sent = data.get('bytes_sent', 0) or 0
            bytes_received = data.get('bytes_received', 0) or 0
            duration = data.get('duration', 0) or 0
            
            # Traffic volume features
            total_bytes = bytes_sent + bytes_received
            features['total_bytes'] = total_bytes
            features['bytes_ratio'] = bytes_sent / max(bytes_received, 1)
            
            # Traffic rate features
            if duration > 0:
                features['bytes_per_second'] = total_bytes / (duration / 1000)  # Convert ms to seconds
            else:
                features['bytes_per_second'] = 0
            
            # Traffic patterns
            features['is_upload_heavy'] = bytes_sent > bytes_received * 2
            features['is_download_heavy'] = bytes_received > bytes_sent * 2
            features['is_balanced_traffic'] = abs(bytes_sent - bytes_received) < max(bytes_sent, bytes_received) * 0.1
            
        except Exception as e:
            logger.error(f"Error extracting traffic features: {str(e)}")
            features = {
                'total_bytes': 0,
                'bytes_ratio': 1.0,
                'bytes_per_second': 0,
                'is_upload_heavy': False,
                'is_download_heavy': False,
                'is_balanced_traffic': True
            }
        
        return features
    
    def _clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and validate data"""
        cleaned = {}
        
        for key, value in data.items():
            if value is None:
                # Set default values for None
                if key in ['source_port', 'destination_port', 'packet_size', 'bytes_sent', 'bytes_received', 'duration', 'response_code']:
                    cleaned[key] = 0
                elif key in ['protocol', 'request_method']:
                    cleaned[key] = 'UNKNOWN'
                elif isinstance(value, bool):
                    cleaned[key] = False
                else:
                    cleaned[key] = ''
            else:
                cleaned[key] = value
        
        return cleaned
    
    def _get_default_entry(self) -> Dict[str, Any]:
        """Get a default entry for failed processing"""
        return {
            'source_ip': '0.0.0.0',
            'destination_ip': '0.0.0.0',
            'source_port': 0,
            'destination_port': 0,
            'protocol': 'UNKNOWN',
            'packet_size': 0,
            'bytes_sent': 0,
            'bytes_received': 0,
            'duration': 0,
            'response_code': 0
        }
