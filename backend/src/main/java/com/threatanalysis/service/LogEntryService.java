package com.threatanalysis.service;

import com.threatanalysis.entity.LogEntry;
import com.threatanalysis.entity.User;
import com.threatanalysis.repository.LogEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogEntryService {

    private final LogEntryRepository logEntryRepository;
    private final AuthService authService;

    @Transactional
    public List<LogEntry> uploadCsvFile(MultipartFile file) {
        try {
            User currentUser = authService.getCurrentUser();
            List<LogEntry> logEntries = new ArrayList<>();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()));
                 CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader())) {

                for (CSVRecord csvRecord : csvParser) {
                    LogEntry logEntry = parseLogEntry(csvRecord, currentUser.getId(), file.getOriginalFilename());
                    if (logEntry != null) {
                        logEntries.add(logEntry);
                    }
                }
            }

            List<LogEntry> savedEntries = logEntryRepository.saveAll(logEntries);
            log.info("Successfully uploaded {} log entries from file: {}", savedEntries.size(), file.getOriginalFilename());
            
            return savedEntries;

        } catch (Exception e) {
            log.error("Error uploading CSV file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload CSV file: " + e.getMessage());
        }
    }

    private LogEntry parseLogEntry(CSVRecord record, Long userId, String fileName) {
        try {
            LogEntry logEntry = new LogEntry();
            
            // Required fields
            logEntry.setSourceIp(getStringValue(record, "source_ip"));
            logEntry.setTimestamp(parseTimestamp(getStringValue(record, "timestamp")));
            
            // Optional fields
            logEntry.setDestinationIp(getStringValue(record, "destination_ip"));
            logEntry.setSourcePort(getIntegerValue(record, "source_port"));
            logEntry.setDestinationPort(getIntegerValue(record, "destination_port"));
            logEntry.setProtocol(getStringValue(record, "protocol"));
            logEntry.setPacketSize(getLongValue(record, "packet_size"));
            logEntry.setAction(getStringValue(record, "action"));
            logEntry.setBytesSent(getLongValue(record, "bytes_sent"));
            logEntry.setBytesReceived(getLongValue(record, "bytes_received"));
            logEntry.setDuration(getLongValue(record, "duration"));
            logEntry.setUserAgent(getStringValue(record, "user_agent"));
            logEntry.setRequestMethod(getStringValue(record, "request_method"));
            logEntry.setRequestUrl(getStringValue(record, "request_url"));
            logEntry.setResponseCode(getIntegerValue(record, "response_code"));
            logEntry.setCountry(getStringValue(record, "country"));
            logEntry.setRegion(getStringValue(record, "region"));
            logEntry.setCity(getStringValue(record, "city"));
            
            // Metadata
            logEntry.setUploadedBy(userId);
            logEntry.setFileName(fileName);
            
            return logEntry;
            
        } catch (Exception e) {
            log.warn("Failed to parse log entry: {}", e.getMessage());
            return null;
        }
    }

    private String getStringValue(CSVRecord record, String columnName) {
        try {
            return record.isMapped(columnName) ? record.get(columnName) : null;
        } catch (Exception e) {
            return null;
        }
    }

    private Integer getIntegerValue(CSVRecord record, String columnName) {
        try {
            String value = getStringValue(record, columnName);
            return value != null && !value.trim().isEmpty() ? Integer.parseInt(value.trim()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private Long getLongValue(CSVRecord record, String columnName) {
        try {
            String value = getStringValue(record, columnName);
            return value != null && !value.trim().isEmpty() ? Long.parseLong(value.trim()) : null;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private LocalDateTime parseTimestamp(String timestampStr) {
        if (timestampStr == null || timestampStr.trim().isEmpty()) {
            return LocalDateTime.now();
        }

        // Try different timestamp formats
        String[] formats = {
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm:ss.SSS",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "MM/dd/yyyy HH:mm:ss",
            "dd/MM/yyyy HH:mm:ss"
        };

        for (String format : formats) {
            try {
                return LocalDateTime.parse(timestampStr.trim(), DateTimeFormatter.ofPattern(format));
            } catch (DateTimeParseException e) {
                // Try next format
            }
        }

        log.warn("Could not parse timestamp: {}, using current time", timestampStr);
        return LocalDateTime.now();
    }

    public Page<LogEntry> getAllLogEntries(Pageable pageable) {
        return logEntryRepository.findAll(pageable);
    }

    public Page<LogEntry> getLogEntriesByUser(Long userId, Pageable pageable) {
        return logEntryRepository.findByUploadedBy(userId, pageable);
    }

    public Page<LogEntry> getLogEntriesByDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return logEntryRepository.findByTimestampBetween(startDate, endDate, pageable);
    }

    public List<LogEntry> getLogEntriesBySourceIp(String sourceIp) {
        return logEntryRepository.findBySourceIp(sourceIp);
    }

    public List<Object[]> getTopSourceIps(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return logEntryRepository.findTopSourceIps(startDate, endDate, pageable);
    }

    public List<Object[]> getProtocolDistribution(LocalDateTime startDate, LocalDateTime endDate) {
        return logEntryRepository.findProtocolDistribution(startDate, endDate);
    }

    public long getLogCountByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return logEntryRepository.countByTimestampBetween(startDate, endDate);
    }

    @Transactional
    public void deleteLogEntry(Long id) {
        logEntryRepository.deleteById(id);
    }

    @Transactional
    public void deleteLogEntriesByFileName(String fileName) {
        List<LogEntry> entries = logEntryRepository.findByFileName(fileName);
        logEntryRepository.deleteAll(entries);
        log.info("Deleted {} log entries for file: {}", entries.size(), fileName);
    }
}
