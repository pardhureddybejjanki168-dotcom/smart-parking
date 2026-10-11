package com.parking.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "audit_logs")
public class AuditLog {
    @Id
    private String id;

    private String actorUserId;

    private String action;

    private String entityType;

    private String entityId;

    private Instant timestamp;

    private Map<String, Object> safeMetadata;

    public AuditLog() {
    }

    public AuditLog(String id, String actorUserId, String action, String entityType,
                    String entityId, Instant timestamp, Map<String, Object> safeMetadata) {
        this.id = id;
        this.actorUserId = actorUserId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.timestamp = timestamp;
        this.safeMetadata = safeMetadata;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String id;
        private String actorUserId;
        private String action;
        private String entityType;
        private String entityId;
        private Instant timestamp;
        private Map<String, Object> safeMetadata;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder actorUserId(String actorUserId) {
            this.actorUserId = actorUserId;
            return this;
        }

        public Builder action(String action) {
            this.action = action;
            return this;
        }

        public Builder entityType(String entityType) {
            this.entityType = entityType;
            return this;
        }

        public Builder entityId(String entityId) {
            this.entityId = entityId;
            return this;
        }

        public Builder timestamp(Instant timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public Builder safeMetadata(Map<String, Object> safeMetadata) {
            this.safeMetadata = safeMetadata;
            return this;
        }

        public AuditLog build() {
            return new AuditLog(id, actorUserId, action, entityType, entityId, timestamp, safeMetadata);
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getActorUserId() {
        return actorUserId;
    }

    public void setActorUserId(String actorUserId) {
        this.actorUserId = actorUserId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, Object> getSafeMetadata() {
        return safeMetadata;
    }

    public void setSafeMetadata(Map<String, Object> safeMetadata) {
        this.safeMetadata = safeMetadata;
    }
}
