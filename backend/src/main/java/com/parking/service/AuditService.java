package com.parking.service;

import com.parking.dto.PagedResponse;
import com.parking.model.AuditLog;
import com.parking.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String actorId, String action, String entityType, String entityId, Map<String, Object> metadata) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .actorUserId(actorId)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .timestamp(Instant.now())
                    .safeMetadata(metadata)
                    .build();
            auditLogRepository.save(auditLog);
            log.info("Audit log saved: action={}, actor={}, entity={}:{}", action, actorId, entityType, entityId);
        } catch (Exception e) {
            log.error("Failed to persist audit log: {}", e.getMessage());
        }
    }

    public PagedResponse<AuditLog> getAllAuditLogs(Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAllByOrderByTimestampDesc(pageable);
        return PagedResponse.of(page);
    }
}
