package com.threatanalysis.service;

import com.threatanalysis.entity.LogEntry;
import com.threatanalysis.entity.ThreatPrediction;
import com.threatanalysis.enums.ThreatSeverity;
import com.threatanalysis.enums.ThreatType;
import com.threatanalysis.repository.ThreatPredictionRepository;
import com.threatanalysis.client.MLServiceClient;
import com.threatanalysis.dto.MLPredictionRequest;
import com.threatanalysis.dto.MLPredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThreatPredictionService {

    private final ThreatPredictionRepository threatPredictionRepository;
    private final MLServiceClient mlServiceClient;
    private final LiveAlertService liveAlertService;

    @Transactional
    public ThreatPrediction analyzeThreat(LogEntry logEntry) {
        try {
            // Prepare ML request
            MLPredictionRequest mlRequest = createMLRequest(logEntry);
            
            // Call ML service
            MLPredictionResponse mlResponse = mlServiceClient.predictThreat(mlRequest);
            
            // Create threat prediction entity
            ThreatPrediction prediction = createThreatPrediction(logEntry, mlResponse);
            
            // Save prediction
            ThreatPrediction savedPrediction = threatPredictionRepository.save(prediction);
            
            // Create live alert if threat is significant
            if (shouldCreateAlert(savedPrediction)) {
                liveAlertService.createAlertFromPrediction(savedPrediction);
            }
            
            log.info("Threat analysis completed for log entry {}: {} (confidence: {})", 
                    logEntry.getId(), savedPrediction.getThreatType(), savedPrediction.getConfidenceScore());
            
            return savedPrediction;
            
        } catch (Exception e) {
            log.error("Error analyzing threat for log entry {}: {}", logEntry.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to analyze threat: " + e.getMessage());
        }
    }

    @Transactional
    public List<ThreatPrediction> analyzeThreatsBatch(List<LogEntry> logEntries) {
        // For batch processing, we could optimize by calling ML service once
        // For now, process individually
        return logEntries.stream()
                .map(this::analyzeThreat)
                .toList();
    }

    private MLPredictionRequest createMLRequest(LogEntry logEntry) {
        MLPredictionRequest request = new MLPredictionRequest();
        request.setSourceIp(logEntry.getSourceIp());
        request.setDestinationIp(logEntry.getDestinationIp());
        request.setSourcePort(logEntry.getSourcePort());
        request.setDestinationPort(logEntry.getDestinationPort());
        request.setProtocol(logEntry.getProtocol());
        request.setPacketSize(logEntry.getPacketSize());
        request.setBytesSent(logEntry.getBytesSent());
        request.setBytesReceived(logEntry.getBytesReceived());
        request.setDuration(logEntry.getDuration());
        request.setUserAgent(logEntry.getUserAgent());
        request.setRequestMethod(logEntry.getRequestMethod());
        request.setRequestUrl(logEntry.getRequestUrl());
        request.setResponseCode(logEntry.getResponseCode());
        request.setCountry(logEntry.getCountry());
        request.setRegion(logEntry.getRegion());
        request.setCity(logEntry.getCity());
        return request;
    }

    private ThreatPrediction createThreatPrediction(LogEntry logEntry, MLPredictionResponse mlResponse) {
        ThreatPrediction prediction = new ThreatPrediction();
        prediction.setLogEntry(logEntry);
        prediction.setThreatType(ThreatType.valueOf(mlResponse.getThreatType()));
        prediction.setSeverity(ThreatSeverity.valueOf(mlResponse.getSeverity()));
        prediction.setConfidenceScore(mlResponse.getConfidenceScore());
        prediction.setRiskScore(mlResponse.getRiskScore());
        prediction.setDescription(mlResponse.getDescription());
        prediction.setRecommendedAction(mlResponse.getRecommendedAction());
        prediction.setModelVersion(mlResponse.getModelVersion());
        prediction.setProcessingTimeMs(mlResponse.getProcessingTimeMs());
        return prediction;
    }

    private boolean shouldCreateAlert(ThreatPrediction prediction) {
        // Create alert for non-normal threats with high confidence
        return prediction.getThreatType() != ThreatType.NORMAL && 
               prediction.getConfidenceScore() > 0.7 &&
               (prediction.getSeverity() == ThreatSeverity.HIGH || 
                prediction.getSeverity() == ThreatSeverity.CRITICAL);
    }

    public Page<ThreatPrediction> getAllPredictions(Pageable pageable) {
        return threatPredictionRepository.findAll(pageable);
    }

    public Page<ThreatPrediction> getPredictionsByThreatType(ThreatType threatType, Pageable pageable) {
        return threatPredictionRepository.findByThreatType(threatType, pageable);
    }

    public Page<ThreatPrediction> getPredictionsBySeverity(ThreatSeverity severity, Pageable pageable) {
        return threatPredictionRepository.findBySeverity(severity, pageable);
    }

    public Page<ThreatPrediction> getPredictionsByConfidence(Double minConfidence, Pageable pageable) {
        return threatPredictionRepository.findByConfidenceScoreGreaterThan(minConfidence, pageable);
    }

    public Page<ThreatPrediction> getPredictionsByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return threatPredictionRepository.findByCreatedAtBetween(startDate, endDate, pageable);
    }

    public List<ThreatPrediction> getPredictionsBySourceIp(String sourceIp) {
        return threatPredictionRepository.findBySourceIp(sourceIp);
    }

    public List<Object[]> getThreatTypeDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        return threatPredictionRepository.findThreatTypeDistribution(startDate, endDate);
    }

    public List<Object[]> getSeverityDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        return threatPredictionRepository.findSeverityDistribution(startDate, endDate);
    }

    public List<ThreatPrediction> getRecentThreats(Double confidenceThreshold, Pageable pageable) {
        return threatPredictionRepository.findRecentThreats(confidenceThreshold, pageable);
    }

    @Transactional
    public ThreatPrediction markAsFalsePositive(Long predictionId, String analystNotes) {
        Optional<ThreatPrediction> predictionOpt = threatPredictionRepository.findById(predictionId);
        if (predictionOpt.isPresent()) {
            ThreatPrediction prediction = predictionOpt.get();
            prediction.setIsFalsePositive(true);
            prediction.setAnalystNotes(analystNotes);
            prediction.setReviewedBy(getCurrentUserId());
            prediction.setReviewedAt(LocalDateTime.now());
            
            ThreatPrediction saved = threatPredictionRepository.save(prediction);
            
            // Update related alert if exists
            liveAlertService.markAlertAsFalsePositive(predictionId);
            
            log.info("Marked prediction {} as false positive", predictionId);
            return saved;
        }
        throw new RuntimeException("Prediction not found: " + predictionId);
    }

    @Transactional
    public ThreatPrediction updateAnalystNotes(Long predictionId, String notes) {
        Optional<ThreatPrediction> predictionOpt = threatPredictionRepository.findById(predictionId);
        if (predictionOpt.isPresent()) {
            ThreatPrediction prediction = predictionOpt.get();
            prediction.setAnalystNotes(notes);
            prediction.setReviewedBy(getCurrentUserId());
            prediction.setReviewedAt(LocalDateTime.now());
            return threatPredictionRepository.save(prediction);
        }
        throw new RuntimeException("Prediction not found: " + predictionId);
    }

    public Optional<ThreatPrediction> getPredictionById(Long id) {
        return threatPredictionRepository.findById(id);
    }

    public long getThreatCountBySeverity(ThreatSeverity severity, LocalDateTime startDate, LocalDateTime endDate) {
        return threatPredictionRepository.countBySeverityAndDateRange(severity, startDate, endDate);
    }

    public Double getAverageConfidenceByThreatType(ThreatType threatType, LocalDateTime startDate, LocalDateTime endDate) {
        return threatPredictionRepository.findAverageConfidenceByThreatType(threatType, startDate, endDate);
    }

    private Long getCurrentUserId() {
        // This would get the current user ID from security context
        // For now, return a default value
        return 1L;
    }
}
