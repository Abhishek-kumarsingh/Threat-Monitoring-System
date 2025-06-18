package com.threatanalysis.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "log_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "source_ip", nullable = false)
    private String sourceIp;
    
    @Column(name = "destination_ip")
    private String destinationIp;
    
    @Column(name = "source_port")
    private Integer sourcePort;
    
    @Column(name = "destination_port")
    private Integer destinationPort;
    
    @Column(name = "protocol")
    private String protocol;
    
    @Column(name = "packet_size")
    private Long packetSize;
    
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;
    
    @Column(name = "action")
    private String action; // ALLOW, DENY, DROP
    
    @Column(name = "bytes_sent")
    private Long bytesSent;
    
    @Column(name = "bytes_received")
    private Long bytesReceived;
    
    @Column(name = "duration")
    private Long duration; // in milliseconds
    
    @Column(name = "user_agent", length = 1000)
    private String userAgent;
    
    @Column(name = "request_method")
    private String requestMethod;
    
    @Column(name = "request_url", length = 2000)
    private String requestUrl;
    
    @Column(name = "response_code")
    private Integer responseCode;
    
    @Column(name = "country")
    private String country;
    
    @Column(name = "region")
    private String region;
    
    @Column(name = "city")
    private String city;
    
    @Column(name = "uploaded_by")
    private Long uploadedBy; // User ID who uploaded this log
    
    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
    
    @Column(name = "file_name")
    private String fileName;
    
    @PrePersist
    protected void onCreate() {
        uploadedAt = LocalDateTime.now();
    }
}
