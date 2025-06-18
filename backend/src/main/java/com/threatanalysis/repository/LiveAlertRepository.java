package com.threatanalysis.repository;

import com.threatanalysis.entity.LiveAlert;
import com.threatanalysis.enums.AlertStatus;
import com.threatanalysis.enums.ThreatSeverity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LiveAlertRepository extends JpaRepository<LiveAlert, Long> {
    
    Page<LiveAlert> findByStatus(AlertStatus status, Pageable pageable);
    
    Page<LiveAlert> findBySeverity(ThreatSeverity severity, Pageable pageable);
    
    Page<LiveAlert> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    List<LiveAlert> findBySourceIp(String sourceIp);
    
    @Query("SELECT la FROM LiveAlert la WHERE la.status = 'ACTIVE' ORDER BY la.severity DESC, la.createdAt DESC")
    List<LiveAlert> findActiveAlertsByPriority(Pageable pageable);
    
    @Query("SELECT COUNT(la) FROM LiveAlert la WHERE la.status = :status")
    long countByStatus(@Param("status") AlertStatus status);
    
    @Query("SELECT COUNT(la) FROM LiveAlert la WHERE la.severity = :severity AND la.status = 'ACTIVE'")
    long countActiveBySeverity(@Param("severity") ThreatSeverity severity);
    
    @Query("SELECT la.severity, COUNT(la) as count FROM LiveAlert la " +
           "WHERE la.createdAt BETWEEN :startDate AND :endDate " +
           "GROUP BY la.severity ORDER BY count DESC")
    List<Object[]> findSeverityDistribution(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT la FROM LiveAlert la WHERE la.status = 'ACTIVE' AND la.createdAt < :date")
    List<LiveAlert> findStaleActiveAlerts(@Param("date") LocalDateTime date);
}
