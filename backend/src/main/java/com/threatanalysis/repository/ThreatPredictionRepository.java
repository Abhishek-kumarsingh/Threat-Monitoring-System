package com.threatanalysis.repository;

import com.threatanalysis.entity.ThreatPrediction;
import com.threatanalysis.enums.ThreatSeverity;
import com.threatanalysis.enums.ThreatType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ThreatPredictionRepository extends JpaRepository<ThreatPrediction, Long> {
    
    Page<ThreatPrediction> findByThreatType(ThreatType threatType, Pageable pageable);
    
    Page<ThreatPrediction> findBySeverity(ThreatSeverity severity, Pageable pageable);
    
    Page<ThreatPrediction> findByConfidenceScoreGreaterThan(Double confidenceScore, Pageable pageable);
    
    Page<ThreatPrediction> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    List<ThreatPrediction> findByIsFalsePositive(Boolean isFalsePositive);
    
    @Query("SELECT tp FROM ThreatPrediction tp WHERE tp.logEntry.sourceIp = :sourceIp")
    List<ThreatPrediction> findBySourceIp(@Param("sourceIp") String sourceIp);
    
    @Query("SELECT tp.threatType, COUNT(tp) as count FROM ThreatPrediction tp " +
           "WHERE tp.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY tp.threatType ORDER BY count DESC")
    List<Object[]> findThreatTypeDistribution(@Param("startDate") LocalDateTime startDate, 
                                            @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT tp.severity, COUNT(tp) as count FROM ThreatPrediction tp " +
           "WHERE tp.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY tp.severity ORDER BY count DESC")
    List<Object[]> findSeverityDistribution(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT AVG(tp.confidenceScore) FROM ThreatPrediction tp " +
           "WHERE tp.threatType = :threatType AND tp.createdAt BETWEEN :startDate AND :endDate")
    Double findAverageConfidenceByThreatType(@Param("threatType") ThreatType threatType,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(tp) FROM ThreatPrediction tp " +
           "WHERE tp.severity = :severity AND tp.createdAt BETWEEN :startDate AND :endDate")
    long countBySeverityAndDateRange(@Param("severity") ThreatSeverity severity,
                                   @Param("startDate") LocalDateTime startDate,
                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT tp FROM ThreatPrediction tp " +
           "WHERE tp.threatType != 'NORMAL' AND tp.confidenceScore > :threshold " +
           "ORDER BY tp.createdAt DESC")
    List<ThreatPrediction> findRecentThreats(@Param("threshold") Double threshold, Pageable pageable);
}
