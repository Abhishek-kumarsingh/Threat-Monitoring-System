-- Initialize the threat analysis database
CREATE DATABASE IF NOT EXISTS threat_analysis_db;
USE threat_analysis_db;

-- Create admin user
INSERT IGNORE INTO users (username, email, password, first_name, last_name, role, is_active, created_at, updated_at) 
VALUES (
    'admin', 
    'admin@threatanalysis.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'System', 
    'Administrator', 
    'ADMIN', 
    true, 
    NOW(), 
    NOW()
);

-- Create analyst user
INSERT IGNORE INTO users (username, email, password, first_name, last_name, role, is_active, created_at, updated_at) 
VALUES (
    'analyst', 
    'analyst@threatanalysis.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Security', 
    'Analyst', 
    'ANALYST', 
    true, 
    NOW(), 
    NOW()
);

-- Create viewer user
INSERT IGNORE INTO users (username, email, password, first_name, last_name, role, is_active, created_at, updated_at) 
VALUES (
    'viewer', 
    'viewer@threatanalysis.com', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Security', 
    'Viewer', 
    'VIEWER', 
    true, 
    NOW(), 
    NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_log_entries_source_ip ON log_entries(source_ip);
CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_log_entries_uploaded_by ON log_entries(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_threat_predictions_threat_type ON threat_predictions(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_predictions_severity ON threat_predictions(severity);
CREATE INDEX IF NOT EXISTS idx_threat_predictions_created_at ON threat_predictions(created_at);

CREATE INDEX IF NOT EXISTS idx_live_alerts_status ON live_alerts(status);
CREATE INDEX IF NOT EXISTS idx_live_alerts_severity ON live_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_live_alerts_created_at ON live_alerts(created_at);

-- Insert sample log entries for testing
INSERT IGNORE INTO log_entries (
    source_ip, destination_ip, source_port, destination_port, protocol, 
    packet_size, timestamp, action, bytes_sent, bytes_received, duration,
    request_method, request_url, response_code, country, region, city,
    uploaded_by, file_name
) VALUES 
('192.168.1.100', '10.0.0.1', 12345, 80, 'TCP', 1500, NOW(), 'ALLOW', 2048, 4096, 1500, 'GET', '/api/data', 200, 'US', 'California', 'San Francisco', 1, 'sample_logs.csv'),
('203.0.113.1', '10.0.0.1', 54321, 443, 'TCP', 1200, NOW(), 'ALLOW', 1024, 8192, 2000, 'POST', '/api/login', 200, 'US', 'New York', 'New York', 1, 'sample_logs.csv'),
('198.51.100.1', '10.0.0.1', 33333, 22, 'TCP', 800, NOW(), 'DENY', 512, 0, 100, 'SSH', '/bin/bash', 401, 'CN', 'Beijing', 'Beijing', 1, 'sample_logs.csv'),
('192.0.2.1', '10.0.0.1', 44444, 3389, 'TCP', 600, NOW(), 'DENY', 256, 0, 50, 'RDP', '/admin', 403, 'RU', 'Moscow', 'Moscow', 1, 'sample_logs.csv');

-- Insert sample threat predictions
INSERT IGNORE INTO threat_predictions (
    log_entry_id, threat_type, severity, confidence_score, risk_score,
    description, recommended_action, model_version, processing_time_ms, created_at, updated_at
) VALUES 
(1, 'NORMAL', 'LOW', 0.95, 5.0, 'Normal HTTP traffic detected', 'No action required - continue monitoring', '1.0.0', 150, NOW(), NOW()),
(2, 'NORMAL', 'LOW', 0.88, 12.0, 'Normal HTTPS login traffic', 'No action required - continue monitoring', '1.0.0', 120, NOW(), NOW()),
(3, 'BRUTE_FORCE', 'HIGH', 0.92, 85.0, 'SSH brute force attack detected', 'Block source IP and investigate', '1.0.0', 200, NOW(), NOW()),
(4, 'UNAUTHORIZED_ACCESS', 'CRITICAL', 0.96, 95.0, 'Unauthorized RDP access attempt', 'IMMEDIATE ACTION: Block IP and alert security team', '1.0.0', 180, NOW(), NOW());

-- Insert sample live alerts
INSERT IGNORE INTO live_alerts (
    threat_prediction_id, title, message, severity, status, source_ip,
    affected_systems, created_at
) VALUES 
(3, 'SSH Brute Force Attack', 'Multiple failed SSH login attempts detected from 198.51.100.1', 'HIGH', 'ACTIVE', '198.51.100.1', 'SSH Server (10.0.0.1:22)', NOW()),
(4, 'Critical RDP Access Attempt', 'Unauthorized RDP access attempt from suspicious IP 192.0.2.1', 'CRITICAL', 'ACTIVE', '192.0.2.1', 'RDP Server (10.0.0.1:3389)', NOW());
