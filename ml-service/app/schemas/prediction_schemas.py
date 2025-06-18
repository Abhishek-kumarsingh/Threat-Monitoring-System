from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class ThreatType(str, Enum):
    MALWARE = "MALWARE"
    PHISHING = "PHISHING"
    DDOS = "DDoS"
    BRUTE_FORCE = "BRUTE_FORCE"
    SQL_INJECTION = "SQL_INJECTION"
    XSS = "XSS"
    SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY"
    DATA_EXFILTRATION = "DATA_EXFILTRATION"
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"
    PORT_SCAN = "PORT_SCAN"
    BOTNET = "BOTNET"
    RANSOMWARE = "RANSOMWARE"
    INSIDER_THREAT = "INSIDER_THREAT"
    APT = "APT"
    NORMAL = "NORMAL"

class ThreatSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class PredictionRequest(BaseModel):
    source_ip: str = Field(..., description="Source IP address")
    destination_ip: Optional[str] = Field(None, description="Destination IP address")
    source_port: Optional[int] = Field(None, description="Source port")
    destination_port: Optional[int] = Field(None, description="Destination port")
    protocol: Optional[str] = Field(None, description="Network protocol")
    packet_size: Optional[int] = Field(None, description="Packet size in bytes")
    bytes_sent: Optional[int] = Field(None, description="Bytes sent")
    bytes_received: Optional[int] = Field(None, description="Bytes received")
    duration: Optional[int] = Field(None, description="Connection duration in ms")
    user_agent: Optional[str] = Field(None, description="User agent string")
    request_method: Optional[str] = Field(None, description="HTTP request method")
    request_url: Optional[str] = Field(None, description="Request URL")
    response_code: Optional[int] = Field(None, description="HTTP response code")
    country: Optional[str] = Field(None, description="Source country")
    region: Optional[str] = Field(None, description="Source region")
    city: Optional[str] = Field(None, description="Source city")
    
    class Config:
        json_schema_extra = {
            "example": {
                "source_ip": "192.168.1.100",
                "destination_ip": "10.0.0.1",
                "source_port": 12345,
                "destination_port": 80,
                "protocol": "TCP",
                "packet_size": 1500,
                "bytes_sent": 2048,
                "bytes_received": 4096,
                "duration": 1500,
                "user_agent": "Mozilla/5.0...",
                "request_method": "GET",
                "request_url": "/api/data",
                "response_code": 200,
                "country": "US",
                "region": "California",
                "city": "San Francisco"
            }
        }

class PredictionResponse(BaseModel):
    threat_type: ThreatType = Field(..., description="Predicted threat type")
    severity: ThreatSeverity = Field(..., description="Threat severity level")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Prediction confidence (0-1)")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk score (0-100)")
    description: str = Field(..., description="Threat description")
    recommended_action: str = Field(..., description="Recommended action")
    model_version: str = Field(..., description="Model version used")
    processing_time_ms: int = Field(..., description="Processing time in milliseconds")
    timestamp: str = Field(..., description="Prediction timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "threat_type": "SUSPICIOUS_ACTIVITY",
                "severity": "MEDIUM",
                "confidence_score": 0.85,
                "risk_score": 65.0,
                "description": "Unusual network activity detected from source IP",
                "recommended_action": "Monitor and investigate further",
                "model_version": "1.0.0",
                "processing_time_ms": 150,
                "timestamp": "2024-01-01T12:00:00Z"
            }
        }

class BatchPredictionRequest(BaseModel):
    log_entries: List[PredictionRequest] = Field(..., description="List of log entries to analyze")
    
    class Config:
        json_schema_extra = {
            "example": {
                "log_entries": [
                    {
                        "source_ip": "192.168.1.100",
                        "destination_ip": "10.0.0.1",
                        "protocol": "TCP",
                        "source_port": 12345,
                        "destination_port": 80
                    }
                ]
            }
        }

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse] = Field(..., description="List of predictions")
    total_processed: int = Field(..., description="Total number of entries processed")
    processing_time_ms: int = Field(..., description="Total processing time in milliseconds")
    timestamp: str = Field(..., description="Batch processing timestamp")

class ModelInfo(BaseModel):
    model_name: str = Field(..., description="Model name")
    version: str = Field(..., description="Model version")
    accuracy: float = Field(..., description="Model accuracy")
    training_date: str = Field(..., description="Last training date")
    features: List[str] = Field(..., description="List of features used by the model")
    threat_types: List[str] = Field(..., description="Supported threat types")
    
    class Config:
        json_schema_extra = {
            "example": {
                "model_name": "ThreatDetectionModel",
                "version": "1.0.0",
                "accuracy": 0.92,
                "training_date": "2024-01-01T00:00:00Z",
                "features": ["source_ip", "destination_port", "protocol", "packet_size"],
                "threat_types": ["MALWARE", "PHISHING", "DDoS", "NORMAL"]
            }
        }
