package com.threatanalysis.controller;

import com.threatanalysis.entity.LogEntry;
import com.threatanalysis.service.LogEntryService;
import com.threatanalysis.service.ThreatPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class LogEntryController {

    private final LogEntryService logEntryService;
    private final ThreatPredictionService threatPredictionService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ANALYST') or hasRole('ADMIN')")
    public ResponseEntity<?> uploadCsvFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            if (!file.getOriginalFilename().toLowerCase().endsWith(".csv")) {
                return ResponseEntity.badRequest().body("Please upload a CSV file");
            }

            List<LogEntry> logEntries = logEntryService.uploadCsvFile(file);
            
            // Analyze threats for uploaded entries (async in production)
            threatPredictionService.analyzeThreatsBatch(logEntries);
            
            return ResponseEntity.ok().body(String.format("Successfully uploaded %d log entries", logEntries.size()));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error uploading file: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Page<LogEntry>> getAllLogEntries(Pageable pageable) {
        Page<LogEntry> logEntries = logEntryService.getAllLogEntries(pageable);
        return ResponseEntity.ok(logEntries);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<Page<LogEntry>> getLogEntriesByUser(@PathVariable Long userId, Pageable pageable) {
        Page<LogEntry> logEntries = logEntryService.getLogEntriesByUser(userId, pageable);
        return ResponseEntity.ok(logEntries);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<LogEntry>> getLogEntriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        Page<LogEntry> logEntries = logEntryService.getLogEntriesByDateRange(startDate, endDate, pageable);
        return ResponseEntity.ok(logEntries);
    }

    @GetMapping("/source-ip/{sourceIp}")
    public ResponseEntity<List<LogEntry>> getLogEntriesBySourceIp(@PathVariable String sourceIp) {
        List<LogEntry> logEntries = logEntryService.getLogEntriesBySourceIp(sourceIp);
        return ResponseEntity.ok(logEntries);
    }

    @GetMapping("/stats/top-source-ips")
    public ResponseEntity<List<Object[]>> getTopSourceIps(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Pageable pageable) {
        List<Object[]> topIps = logEntryService.getTopSourceIps(startDate, endDate, pageable);
        return ResponseEntity.ok(topIps);
    }

    @GetMapping("/stats/protocol-distribution")
    public ResponseEntity<List<Object[]>> getProtocolDistribution(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Object[]> distribution = logEntryService.getProtocolDistribution(startDate, endDate);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/stats/count")
    public ResponseEntity<Long> getLogCount(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        long count = logEntryService.getLogCountByDateRange(startDate, endDate);
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteLogEntry(@PathVariable Long id) {
        try {
            logEntryService.deleteLogEntry(id);
            return ResponseEntity.ok("Log entry deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting log entry: " + e.getMessage());
        }
    }

    @DeleteMapping("/file/{fileName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteLogEntriesByFileName(@PathVariable String fileName) {
        try {
            logEntryService.deleteLogEntriesByFileName(fileName);
            return ResponseEntity.ok("Log entries deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting log entries: " + e.getMessage());
        }
    }
}
