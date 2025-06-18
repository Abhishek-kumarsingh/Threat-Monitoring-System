package com.threatanalysis.entity;

import com.threatanalysis.enums.ThreatType;
import com.threatanalysis.enums.ThreatSeverity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "threat_predictions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThreatPrediction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "log_entry_id", nullable = false)
    private LogEntry logEntry;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "threat_type", nullable = false)
    private ThreatType threatType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false)
    private ThreatSeverity severity;
    
    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore; // 0.0 to 1.0
    
    @Column(name = "risk_score", nullable = false)
    private Double riskScore; // 0.0 to 100.0
    
    @Column(name = "description", length = 1000)
    private String description;
    
    @Column(name = "recommended_action", length = 500)
    private String recommendedAction;
    
    @Column(name = "is_false_positive")
    private Boolean isFalsePositive = false;
    
    @Column(name = "analyst_notes", length = 2000)
    private String analystNotes;
    
    @Column(name = "reviewed_by")
    private Long reviewedBy; // User ID who reviewed this prediction
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "model_version")
    private String modelVersion;
    
    @Column(name = "processing_time_ms")
    private Long processingTimeMs;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
