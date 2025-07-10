import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
from typing import Dict, List, Any, Optional
import os
import logging
from datetime import datetime
import asyncio

from ..schemas.prediction_schemas import ThreatType, ThreatSeverity, ModelInfo
import shap
from lime.lime_tabular import LimeTabularExplainer

logger = logging.getLogger(__name__)

class ThreatPredictor:
    def __init__(self):
        self.threat_classifier = None
        self.anomaly_detector = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model_version = "1.0.0"
        self.training_date = None
        self.feature_names = []
        self.is_loaded = False
        
    async def load_models(self):
        """Load pre-trained models or create new ones if not available"""
        try:
            model_path = "./models"
            os.makedirs(model_path, exist_ok=True)
            
            # Try to load existing models
            classifier_path = os.path.join(model_path, "threat_classifier.joblib")
            anomaly_path = os.path.join(model_path, "anomaly_detector.joblib")
            scaler_path = os.path.join(model_path, "scaler.joblib")
            
            if all(os.path.exists(p) for p in [classifier_path, anomaly_path, scaler_path]):
                logger.info("Loading existing models...")
                self.threat_classifier = joblib.load(classifier_path)
                self.anomaly_detector = joblib.load(anomaly_path)
                self.scaler = joblib.load(scaler_path)
                self.training_date = datetime.now().isoformat()
            else:
                logger.info("Creating new models...")
                await self._create_default_models()
                await self._save_models()
            
            self.is_loaded = True
            logger.info("Models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {str(e)}")
            # Create basic models as fallback
            await self._create_default_models()
            self.is_loaded = True
    
    async def _create_default_models(self):
        """Create default models with synthetic data for demonstration"""
        logger.info("Creating default models with synthetic data...")
        
        # Generate synthetic training data
        np.random.seed(42)
        n_samples = 1000
        
        # Feature names
        self.feature_names = [
            'source_port', 'destination_port', 'packet_size', 'bytes_sent', 
            'bytes_received', 'duration', 'response_code', 'protocol_encoded',
            'hour_of_day', 'day_of_week', 'is_weekend'
        ]
        
        # Generate synthetic features
        X = np.random.randn(n_samples, len(self.feature_names))
        
        # Create synthetic labels (threat types)
        threat_types = ['NORMAL', 'MALWARE', 'PHISHING', 'DDoS', 'BRUTE_FORCE', 'SUSPICIOUS_ACTIVITY']
        y = np.random.choice(threat_types, n_samples, p=[0.7, 0.1, 0.05, 0.05, 0.05, 0.05])
        
        # Train threat classifier
        self.threat_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.threat_classifier.fit(X, y)
        
        # Train anomaly detector
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.anomaly_detector.fit(X)
        
        # Fit scaler
        self.scaler.fit(X)
        
        self.training_date = datetime.now().isoformat()
        logger.info("Default models created successfully")
    
    async def _save_models(self):
        """Save trained models to disk"""
        try:
            model_path = "./models"
            os.makedirs(model_path, exist_ok=True)
            
            joblib.dump(self.threat_classifier, os.path.join(model_path, "threat_classifier.joblib"))
            joblib.dump(self.anomaly_detector, os.path.join(model_path, "anomaly_detector.joblib"))
            joblib.dump(self.scaler, os.path.join(model_path, "scaler.joblib"))
            
            logger.info("Models saved successfully")
        except Exception as e:
            logger.error(f"Failed to save models: {str(e)}")
    
    def _extract_features(self, data: Dict[str, Any]) -> np.ndarray:
        """Extract features from log entry data"""
        features = []
        
        # Numerical features
        features.append(data.get('source_port', 0))
        features.append(data.get('destination_port', 0))
        features.append(data.get('packet_size', 0))
        features.append(data.get('bytes_sent', 0))
        features.append(data.get('bytes_received', 0))
        features.append(data.get('duration', 0))
        features.append(data.get('response_code', 0))
        
        # Encode protocol
        protocol = data.get('protocol', 'TCP')
        protocol_map = {'TCP': 1, 'UDP': 2, 'HTTP': 3, 'HTTPS': 4, 'ICMP': 5}
        features.append(protocol_map.get(protocol, 0))
        
        # Time-based features (mock for now)
        features.append(12)  # hour_of_day
        features.append(1)   # day_of_week
        features.append(0)   # is_weekend
        
        return np.array(features).reshape(1, -1)
    
    def _determine_severity(self, threat_type: str, confidence: float, anomaly_score: float) -> ThreatSeverity:
        """Determine threat severity based on type, confidence, and anomaly score"""
        if threat_type == 'NORMAL':
            return ThreatSeverity.LOW
        
        # High-risk threat types
        high_risk_threats = ['MALWARE', 'RANSOMWARE', 'APT', 'DATA_EXFILTRATION']
        medium_risk_threats = ['PHISHING', 'DDoS', 'SQL_INJECTION', 'UNAUTHORIZED_ACCESS']
        
        if threat_type in high_risk_threats:
            if confidence > 0.8:
                return ThreatSeverity.CRITICAL
            elif confidence > 0.6:
                return ThreatSeverity.HIGH
            else:
                return ThreatSeverity.MEDIUM
        elif threat_type in medium_risk_threats:
            if confidence > 0.8:
                return ThreatSeverity.HIGH
            elif confidence > 0.6:
                return ThreatSeverity.MEDIUM
            else:
                return ThreatSeverity.LOW
        else:
            return ThreatSeverity.MEDIUM if confidence > 0.7 else ThreatSeverity.LOW
    
    def _get_threat_description(self, threat_type: str) -> str:
        """Get description for threat type"""
        descriptions = {
            'NORMAL': 'Normal network activity detected',
            'MALWARE': 'Potential malware activity detected',
            'PHISHING': 'Possible phishing attempt identified',
            'DDoS': 'Distributed Denial of Service attack pattern detected',
            'BRUTE_FORCE': 'Brute force attack attempt detected',
            'SQL_INJECTION': 'SQL injection attack pattern identified',
            'XSS': 'Cross-site scripting attempt detected',
            'SUSPICIOUS_ACTIVITY': 'Unusual network activity detected',
            'DATA_EXFILTRATION': 'Potential data exfiltration detected',
            'UNAUTHORIZED_ACCESS': 'Unauthorized access attempt detected',
            'PORT_SCAN': 'Port scanning activity detected',
            'BOTNET': 'Botnet activity detected',
            'RANSOMWARE': 'Ransomware activity detected',
            'INSIDER_THREAT': 'Potential insider threat detected',
            'APT': 'Advanced Persistent Threat detected'
        }
        return descriptions.get(threat_type, 'Unknown threat type detected')
    
    def _get_recommended_action(self, threat_type: str, severity: ThreatSeverity) -> str:
        """Get recommended action based on threat type and severity"""
        if threat_type == 'NORMAL':
            return 'No action required - continue monitoring'
        
        if severity == ThreatSeverity.CRITICAL:
            return 'IMMEDIATE ACTION REQUIRED: Isolate affected systems and investigate'
        elif severity == ThreatSeverity.HIGH:
            return 'HIGH PRIORITY: Block source IP and investigate immediately'
        elif severity == ThreatSeverity.MEDIUM:
            return 'MEDIUM PRIORITY: Monitor closely and consider blocking'
        else:
            return 'LOW PRIORITY: Log and monitor for patterns'
    
    async def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction for a single log entry"""
        if not self.is_loaded:
            raise RuntimeError("Models not loaded")
        
        try:
            # Extract features
            features = self._extract_features(data)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Get threat prediction
            threat_proba = self.threat_classifier.predict_proba(features_scaled)[0]
            threat_classes = self.threat_classifier.classes_
            
            # Get the most likely threat
            max_idx = np.argmax(threat_proba)
            predicted_threat = threat_classes[max_idx]
            confidence = threat_proba[max_idx]
            
            # Get anomaly score
            anomaly_score = self.anomaly_detector.decision_function(features_scaled)[0]
            
            # Determine severity
            severity = self._determine_severity(predicted_threat, confidence, anomaly_score)
            
            # Calculate risk score
            risk_score = min(100.0, confidence * 100 + abs(anomaly_score) * 10)
            
            return {
                'threat_type': predicted_threat,
                'severity': severity.value,
                'confidence_score': float(confidence),
                'risk_score': float(risk_score),
                'description': self._get_threat_description(predicted_threat),
                'recommended_action': self._get_recommended_action(predicted_threat, severity),
                'model_version': self.model_version
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            raise e
    
    async def predict_batch(self, data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Make predictions for multiple log entries"""
        predictions = []
        
        for data in data_list:
            try:
                prediction = await self.predict_single(data)
                predictions.append(prediction)
            except Exception as e:
                logger.error(f"Batch prediction error for entry: {str(e)}")
                # Add error prediction
                predictions.append({
                    'threat_type': 'NORMAL',
                    'severity': 'LOW',
                    'confidence_score': 0.0,
                    'risk_score': 0.0,
                    'description': f'Prediction failed: {str(e)}',
                    'recommended_action': 'Review data format',
                    'model_version': self.model_version
                })
        
        return predictions
    
    async def get_model_info(self) -> ModelInfo:
        """Get information about the loaded models"""
        return ModelInfo(
            model_name="ThreatDetectionModel",
            version=self.model_version,
            accuracy=0.92,  # Mock accuracy
            training_date=self.training_date or datetime.now().isoformat(),
            features=self.feature_names,
            threat_types=[threat.value for threat in ThreatType]
        )
    
    async def retrain_model(self, training_data: pd.DataFrame) -> Dict[str, Any]:
        """Retrain the model with new data"""
        try:
            # This is a simplified retraining process
            # In production, you'd want more sophisticated data validation and model evaluation
            
            logger.info("Starting model retraining...")
            
            # Prepare features and labels
            # This assumes the training data has the right format
            X = training_data.drop(['threat_type'], axis=1)
            y = training_data['threat_type']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Retrain classifier
            self.threat_classifier = RandomForestClassifier(n_estimators=100, random_state=42)
            self.threat_classifier.fit(X_train, y_train)
            
            # Retrain anomaly detector
            self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
            self.anomaly_detector.fit(X_train)
            
            # Refit scaler
            self.scaler.fit(X_train)
            
            # Calculate accuracy
            y_pred = self.threat_classifier.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Update training date
            self.training_date = datetime.now().isoformat()
            
            # Save updated models
            await self._save_models()
            
            logger.info(f"Model retrained successfully with accuracy: {accuracy}")
            
            return {
                "training_samples": len(training_data),
                "accuracy": accuracy
            }
            
        except Exception as e:
            logger.error(f"Retraining error: {str(e)}")
            raise e
    
    async def explain_prediction(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Provide explanation for a prediction using SHAP values"""
        if not self.is_loaded:
            raise RuntimeError("Models not loaded")
            
        try:
            # Extract features
            features = self._extract_features(data)
            features_scaled = self.scaler.transform(features)
            
            # Get SHAP values
            explainer = shap.TreeExplainer(self.threat_classifier)
            shap_values = explainer.shap_values(features_scaled)
            
            # Get feature importance
            feature_importance = dict(zip(self.feature_names, 
                                         np.abs(shap_values).mean(axis=0)))
            
            return {
                "feature_importance": feature_importance,
                "top_factors": sorted(feature_importance.items(), 
                                     key=lambda x: x[1], reverse=True)[:5]
            }
        except Exception as e:
            logger.error(f"Explanation error: {str(e)}")
            raise e
