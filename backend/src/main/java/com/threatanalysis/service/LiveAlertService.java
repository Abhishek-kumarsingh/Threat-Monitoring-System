package com.threatanalysis.service;

import com.threatanalysis.entity.LiveAlert;
import com.threatanalysis.entity.ThreatPrediction;
import com.threatanalysis.enums.AlertStatus;
import com.threatanalysis.enums.ThreatSeverity;
import com.threatanalysis.repository.LiveAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LiveAlertService {

    private final LiveAlertRepository liveAlertRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public LiveAlert createAlertFromPrediction(ThreatPrediction prediction) {
        try {
            LiveAlert alert = new LiveAlert();
            alert.setThreatPrediction(prediction);
            alert.setTitle(generateAlertTitle(prediction));
            alert.setMessage(generateAlertMessage(prediction));
            alert.setSeverity(prediction.getSeverity());
            alert.setStatus(AlertStatus.ACTIVE);
            alert.setSourceIp(prediction.getLogEntry().getSourceIp());
            alert.setAffectedSystems(generateAffectedSystems(prediction));
            
            LiveAlert savedAlert = liveAlertRepository.save(alert);
            
            // Send real-time notification via WebSocket
            sendAlertNotification(savedAlert);
            
            log.info("Created live alert {} for threat prediction {}", savedAlert.getId(), prediction.getId());
            return savedAlert;
            
        } catch (Exception e) {
            log.error("Error creating live alert for prediction {}: {}", prediction.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to create live alert: " + e.getMessage());
        }
    }

    @Transactional
    public LiveAlert createCustomAlert(String title, String message, ThreatSeverity severity, String sourceIp) {
        LiveAlert alert = new LiveAlert();
        alert.setTitle(title);
        alert.setMessage(message);
        alert.setSeverity(severity);
        alert.setStatus(AlertStatus.ACTIVE);
        alert.setSourceIp(sourceIp);
        
        LiveAlert savedAlert = liveAlertRepository.save(alert);
        sendAlertNotification(savedAlert);
        
        log.info("Created custom alert: {}", title);
        return savedAlert;
    }

    private String generateAlertTitle(ThreatPrediction prediction) {
        String threatType = prediction.getThreatType().name().replace("_", " ");
        return switch (prediction.getThreatType()) {
            case MALWARE -> "Malware Activity Detected";
            case PHISHING -> "Phishing Attempt Detected";
            case DDoS -> "DDoS Attack Detected";
            case BRUTE_FORCE -> "Brute Force Attack Detected";
            case SQL_INJECTION -> "SQL Injection Attempt Detected";
            case XSS -> "XSS Attack Detected";
            case UNAUTHORIZED_ACCESS -> "Unauthorized Access Attempt";
            case DATA_EXFILTRATION -> "Data Exfiltration Detected";
            case PORT_SCAN -> "Port Scanning Activity";
            case BOTNET -> "Botnet Activity Detected";
            case RANSOMWARE -> "Ransomware Activity Detected";
            case INSIDER_THREAT -> "Insider Threat Detected";
            case APT -> "Advanced Persistent Threat";
            default -> threatType + " Detected";
        };
    }

    private String generateAlertMessage(ThreatPrediction prediction) {
        String sourceIp = prediction.getLogEntry().getSourceIp();
        String confidence = String.format("%.1f%%", prediction.getConfidenceScore() * 100);
        
        return String.format("%s from IP %s (Confidence: %s, Risk Score: %.1f). %s", 
                prediction.getDescription(), 
                sourceIp, 
                confidence, 
                prediction.getRiskScore(),
                prediction.getRecommendedAction());
    }

    private String generateAffectedSystems(ThreatPrediction prediction) {
        String destIp = prediction.getLogEntry().getDestinationIp();
        Integer destPort = prediction.getLogEntry().getDestinationPort();
        
        if (destIp != null && destPort != null) {
            return String.format("%s:%d", destIp, destPort);
        } else if (destIp != null) {
            return destIp;
        }
        return "Unknown";
    }

    private void sendAlertNotification(LiveAlert alert) {
        try {
            // Send to all connected clients
            messagingTemplate.convertAndSend("/topic/alerts", alert);
            
            // Send to specific severity channels
            messagingTemplate.convertAndSend("/topic/alerts/" + alert.getSeverity().name().toLowerCase(), alert);
            
            log.debug("Sent WebSocket notification for alert {}", alert.getId());
        } catch (Exception e) {
            log.error("Failed to send WebSocket notification for alert {}: {}", alert.getId(), e.getMessage());
        }
    }

    public Page<LiveAlert> getAllAlerts(Pageable pageable) {
        return liveAlertRepository.findAll(pageable);
    }

    public Page<LiveAlert> getAlertsByStatus(AlertStatus status, Pageable pageable) {
        return liveAlertRepository.findByStatus(status, pageable);
    }

    public Page<LiveAlert> getAlertsBySeverity(ThreatSeverity severity, Pageable pageable) {
        return liveAlertRepository.findBySeverity(severity, pageable);
    }

    public List<LiveAlert> getActiveAlertsByPriority(Pageable pageable) {
        return liveAlertRepository.findActiveAlertsByPriority(pageable);
    }

    public List<LiveAlert> getAlertsBySourceIp(String sourceIp) {
        return liveAlertRepository.findBySourceIp(sourceIp);
    }

    @Transactional
    public LiveAlert acknowledgeAlert(Long alertId, String notes) {
        Optional<LiveAlert> alertOpt = liveAlertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            LiveAlert alert = alertOpt.get();
            alert.setStatus(AlertStatus.ACKNOWLEDGED);
            alert.setAcknowledgedAt(LocalDateTime.now());
            alert.setAcknowledgedBy(getCurrentUserId());
            if (notes != null) {
                alert.setResolutionNotes(notes);
            }
            
            LiveAlert savedAlert = liveAlertRepository.save(alert);
            
            // Send update notification
            messagingTemplate.convertAndSend("/topic/alerts/updates", savedAlert);
            
            log.info("Alert {} acknowledged by user {}", alertId, getCurrentUserId());
            return savedAlert;
        }
        throw new RuntimeException("Alert not found: " + alertId);
    }

    @Transactional
    public LiveAlert resolveAlert(Long alertId, String resolutionNotes) {
        Optional<LiveAlert> alertOpt = liveAlertRepository.findById(alertId);
        if (alertOpt.isPresent()) {
            LiveAlert alert = alertOpt.get();
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(getCurrentUserId());
            alert.setResolutionNotes(resolutionNotes);
            
            LiveAlert savedAlert = liveAlertRepository.save(alert);
            
            // Send update notification
            messagingTemplate.convertAndSend("/topic/alerts/updates", savedAlert);
            
            log.info("Alert {} resolved by user {}", alertId, getCurrentUserId());
            return savedAlert;
        }
        throw new RuntimeException("Alert not found: " + alertId);
    }

    @Transactional
    public LiveAlert markAlertAsFalsePositive(Long predictionId) {
        // Find alert by prediction ID
        List<LiveAlert> alerts = liveAlertRepository.findAll().stream()
                .filter(alert -> alert.getThreatPrediction() != null && 
                        alert.getThreatPrediction().getId().equals(predictionId))
                .toList();
        
        if (!alerts.isEmpty()) {
            LiveAlert alert = alerts.get(0);
            alert.setStatus(AlertStatus.FALSE_POSITIVE);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolvedBy(getCurrentUserId());
            alert.setResolutionNotes("Marked as false positive based on threat prediction review");
            
            LiveAlert savedAlert = liveAlertRepository.save(alert);
            
            // Send update notification
            messagingTemplate.convertAndSend("/topic/alerts/updates", savedAlert);
            
            log.info("Alert {} marked as false positive", alert.getId());
            return savedAlert;
        }
        return null;
    }

    public long getAlertCountByStatus(AlertStatus status) {
        return liveAlertRepository.countByStatus(status);
    }

    public long getActiveAlertCountBySeverity(ThreatSeverity severity) {
        return liveAlertRepository.countActiveBySeverity(severity);
    }

    public List<Object[]> getSeverityDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        return liveAlertRepository.findSeverityDistribution(startDate, endDate);
    }

    @Transactional
    public void cleanupStaleAlerts(int hoursThreshold) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(hoursThreshold);
        List<LiveAlert> staleAlerts = liveAlertRepository.findStaleActiveAlerts(cutoffTime);
        
        for (LiveAlert alert : staleAlerts) {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());
            alert.setResolutionNotes("Auto-resolved due to age");
        }
        
        liveAlertRepository.saveAll(staleAlerts);
        log.info("Auto-resolved {} stale alerts older than {} hours", staleAlerts.size(), hoursThreshold);
    }

    public Optional<LiveAlert> getAlertById(Long id) {
        return liveAlertRepository.findById(id);
    }

    private Long getCurrentUserId() {
        // This would get the current user ID from security context
        // For now, return a default value
        return 1L;
    }
}
