package com.techshop.order.messaging;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class OrderEventMessage {
    private String eventId;
    private String eventType;
    private String tenantId;
    private String aggregateId;
    private LocalDateTime occurredAt;
    private Integer schemaVersion;
    private Map<String, Object> payload;
}
