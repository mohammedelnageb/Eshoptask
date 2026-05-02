package com.techshop.payment.messaging;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentCommandMessage {
    private String eventId;
    private String eventType;
    private String tenantId;
    private String aggregateId;
    private Map<String, Object> payload;
}
