package com.threatanalysis.controller;

import com.threatanalysis.entity.ThreatPrediction;
import com.threatanalysis.enums.ThreatSeverity;
import com.threatanalysis.enums.ThreatType;
import com.threatanalysis.service.ThreatPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/threats")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ThreatPredictionController {

    private final ThreatPredictionService threatPredictionService;

    @GetMapping
    public ResponseEntity<Page<ThreatPrediction>> getAllPredictions(Pageable pageable) {
        Page<ThreatPrediction> predictions = threatPredictionService.getAllPredictions(pageable);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThreatPrediction> getPredictionById(@PathVariable Long id) {
        Optional<ThreatPrediction> prediction = threatPredictionService.getPredictionById(id);
        return prediction.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/type/{threatType}")
    public ResponseEntity<Page<ThreatPrediction>> getPredictionsByThreatType(
            @PathVariable ThreatType threatType, Pageable pageable) {
        Page<ThreatPrediction> predictions = threatPredictionService.getPredictionsByThreatType(threatType, pageable);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<Page<ThreatPrediction>> getPredictionsBySeverity(
            @PathVariable ThreatSeverity severity, Pageable pageable) {
        Page<ThreatPrediction> predictions = threatPredictionService.getPredictionsBySeverity(severity, pageable);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/confidence/{minConfidence}")
    public ResponseEntity<Page<ThreatPrediction>> getPredictionsByConfidence(
            @PathVariable Double minConfidence, Pageable pageable) {
        Page<ThreatPrediction> predictions = threatPredictionService.getPredictionsByConfidence(minConfidence, pageable);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<ThreatPrediction>> getPredictionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        Page<ThreatPrediction> predictions = threatPredictionService.getPredictionsByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/source-ip/{sourceIp}")
    public ResponseEntity<List<ThreatPrediction>> getPredictionsBySourceIp(@PathVariable String sourceIp) {
        List<ThreatPrediction> predictions = threatPredictionService.getPredictionsBySourceIp(sourceIp);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ThreatPrediction>> getRecentThreats(
            @RequestParam(defaultValue = "0.7") Double confidenceThreshold,
            Pageable pageable) {
        List<ThreatPrediction> predictions = threatPredictionService.getRecentThreats(confidenceThreshold, pageable);
        return ResponseEntity.ok(predictions);
    }

    @GetMapping("/stats/threat-type-distribution")
    public ResponseEntity<List<Object[]>> getThreatTypeDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Object[]> distribution = threatPredictionService.getThreatTypeDistribution(startDate, endDate);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/stats/severity-distribution")
    public ResponseEntity<List<Object[]>> getSeverityDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Object[]> distribution = threatPredictionService.getSeverityDistribution(startDate, endDate);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/stats/count/{severity}")
    public ResponseEntity<Long> getThreatCountBySeverity(
            @PathVariable ThreatSeverity severity,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        long count = threatPredictionService.getThreatCountBySeverity(severity, startDate, endDate);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/average-confidence/{threatType}")
    public ResponseEntity<Double> getAverageConfidenceByThreatType(
            @PathVariable ThreatType threatType,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Double avgConfidence = threatPredictionService.getAverageConfidenceByThreatType(threatType, startDate, endDate);
        return ResponseEntity.ok(avgConfidence != null ? avgConfidence : 0.0);
    }

    @PutMapping("/{id}/false-positive")
    @PreAuthorize("hasRole('ANALYST') or hasRole('ADMIN')")
    public ResponseEntity<ThreatPrediction> markAsFalsePositive(
            @PathVariable Long id,
            @RequestBody(required = false) String analystNotes) {
        try {
            ThreatPrediction updated = threatPredictionService.markAsFalsePositive(id, analystNotes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/notes")
    @PreAuthorize("hasRole('ANALYST') or hasRole('ADMIN')")
    public ResponseEntity<ThreatPrediction> updateAnalystNotes(
            @PathVariable Long id,
            @RequestBody String notes) {
        try {
            ThreatPrediction updated = threatPredictionService.updateAnalystNotes(id, notes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
