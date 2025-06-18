package com.threatanalysis.repository;

import com.threatanalysis.entity.LogEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogEntryRepository extends JpaRepository<LogEntry, Long> {
    
    Page<LogEntry> findByUploadedBy(Long uploadedBy, Pageable pageable);
    
    Page<LogEntry> findByTimestampBetween(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    
    List<LogEntry> findBySourceIp(String sourceIp);
    
    @Query("SELECT l FROM LogEntry l WHERE l.sourceIp = :ip OR l.destinationIp = :ip")
    List<LogEntry> findByIpAddress(@Param("ip") String ip);
    
    @Query("SELECT l.sourceIp, COUNT(l) as count FROM LogEntry l " +
           "WHERE l.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY l.sourceIp ORDER BY count DESC")
    List<Object[]> findTopSourceIps(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate, 
                                   Pageable pageable);
    
    @Query("SELECT l.protocol, COUNT(l) as count FROM LogEntry l " +
           "WHERE l.timestamp BETWEEN :startDate AND :endDate " +
           "GROUP BY l.protocol ORDER BY count DESC")
    List<Object[]> findProtocolDistribution(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT COUNT(l) FROM LogEntry l WHERE l.timestamp BETWEEN :startDate AND :endDate")
    long countByTimestampBetween(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT l FROM LogEntry l WHERE l.fileName = :fileName")
    List<LogEntry> findByFileName(@Param("fileName") String fileName);
}
