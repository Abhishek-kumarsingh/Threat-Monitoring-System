package com.threatanalysis.entity;

import com.threatanalysis.enums.AlertStatus;
import com.threatanalysis.enums.ThreatSeverity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "live_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveAlert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "threat_prediction_id")
    private ThreatPrediction threatPrediction;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", length = 2000, nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private ThreatSeverity severity;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AlertStatus status = AlertStatus.ACTIVE;
    
    @Column(name = "source_ip")
    private String sourceIp;
    
    @Column(name = "affected_systems", length = 1000)
    private String affectedSystems;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "acknowledged_by")
    private Long acknowledgedBy; // User ID
    
    @Column(name = "resolved_by")
    private Long resolvedBy; // User ID
    
    @Column(name = "resolution_notes", length = 2000)
    private String resolutionNotes;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
