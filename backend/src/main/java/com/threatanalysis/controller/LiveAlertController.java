package com.threatanalysis.controller;

import com.threatanalysis.entity.LiveAlert;
import com.threatanalysis.enums.AlertStatus;
import com.threatanalysis.enums.ThreatSeverity;
import com.threatanalysis.service.LiveAlertService;
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
@RequestMapping("/alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LiveAlertController {

    private final LiveAlertService liveAlertService;

    @GetMapping
    public ResponseEntity<Page<LiveAlert>> getAllAlerts(Pageable pageable) {
        Page<LiveAlert> alerts = liveAlertService.getAllAlerts(pageable);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiveAlert> getAlertById(@PathVariable Long id) {
        Optional<LiveAlert> alert = liveAlertService.getAlertById(id);
        return alert.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<LiveAlert>> getAlertsByStatus(
            @PathVariable AlertStatus status, Pageable pageable) {
        Page<LiveAlert> alerts = liveAlertService.getAlertsByStatus(status, pageable);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/severity/{severity}")
    public ResponseEntity<Page<LiveAlert>> getAlertsBySeverity(
            @PathVariable ThreatSeverity severity, Pageable pageable) {
        Page<LiveAlert> alerts = liveAlertService.getAlertsBySeverity(severity, pageable);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/active")
    public ResponseEntity<List<LiveAlert>> getActiveAlertsByPriority(Pageable pageable) {
        List<LiveAlert> alerts = liveAlertService.getActiveAlertsByPriority(pageable);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/source-ip/{sourceIp}")
    public ResponseEntity<List<LiveAlert>> getAlertsBySourceIp(@PathVariable String sourceIp) {
        List<LiveAlert> alerts = liveAlertService.getAlertsBySourceIp(sourceIp);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/stats/count/{status}")
    public ResponseEntity<Long> getAlertCountByStatus(@PathVariable AlertStatus status) {
        long count = liveAlertService.getAlertCountByStatus(status);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/active-count/{severity}")
    public ResponseEntity<Long> getActiveAlertCountBySeverity(@PathVariable ThreatSeverity severity) {
        long count = liveAlertService.getActiveAlertCountBySeverity(severity);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/stats/severity-distribution")
    public ResponseEntity<List<Object[]>> getSeverityDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Object[]> distribution = liveAlertService.getSeverityDistribution(startDate, endDate);
        return ResponseEntity.ok(distribution);
    }

    @PostMapping("/custom")
    @PreAuthorize("hasRole('ANALYST') or hasRole('ADMIN')")
    public ResponseEntity<LiveAlert> createCustomAlert(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam ThreatSeverity severity,
            @RequestParam(required = false) String sourceIp) {
        try {
            LiveAlert alert = liveAlertService.createCustomAlert(title, message, severity, sourceIp);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/acknowledge")
    @PreAuthorize("hasRole('ANALYST') or hasRole('ADMIN')")
    public ResponseEntity<LiveAlert> acknowledgeAlert(
            @PathVariable Long id,
            @RequestBody(required = false) String notes) {
        try {
            LiveAlert alert = liveAlertService.acknowledgeAlert(id, notes);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ANALYST') or hasRole('ADMIN')")
    public ResponseEntity<LiveAlert> resolveAlert(
            @PathVariable Long id,
            @RequestBody String resolutionNotes) {
        try {
            LiveAlert alert = liveAlertService.resolveAlert(id, resolutionNotes);
            return ResponseEntity.ok(alert);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/cleanup-stale")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> cleanupStaleAlerts(@RequestParam(defaultValue = "24") int hoursThreshold) {
        try {
            liveAlertService.cleanupStaleAlerts(hoursThreshold);
            return ResponseEntity.ok("Stale alerts cleanup completed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error during cleanup: " + e.getMessage());
        }
    }
}
