package com.techshop.payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.payment.messaging.PaymentCommandMessage;
import com.techshop.payment.messaging.PaymentResultMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockPaymentProcessor {

    private static final String PAYMENT_RESULTS_TOPIC = "payment-results";

    private final ObjectMapper objectMapper;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Value("${techshop.payment.failure-threshold:10000}")
    private BigDecimal failureThreshold;

    @KafkaListener(topics = "payment-commands", groupId = "payment-service")
    public void processPaymentCommand(String payload) {
        try {
            PaymentCommandMessage command = objectMapper.readValue(payload, PaymentCommandMessage.class);
            PaymentResultMessage result = buildResult(command);
            kafkaTemplate.send(PAYMENT_RESULTS_TOPIC, result.getOrderNumber(), objectMapper.writeValueAsString(result));
            log.info("Published payment result orderNumber={} status={}", result.getOrderNumber(), result.getStatus());
        } catch (JsonProcessingException ex) {
            log.error("Failed to parse or publish payment command", ex);
        }
    }

    private PaymentResultMessage buildResult(PaymentCommandMessage command) {
        Map<String, Object> body = command.getPayload();
        BigDecimal amount = decimal(body.get("amount"));
        boolean approved = amount.compareTo(failureThreshold) <= 0;
        String orderNumber = string(body.get("orderNumber"));

        return PaymentResultMessage.builder()
                .orderNumber(orderNumber)
                .orderId(longValue(body.get("orderId")))
                .tenantId(command.getTenantId())
                .status(approved ? "COMPLETED" : "FAILED")
                .paymentReference(approved ? "MOCK-" + UUID.randomUUID() : null)
                .failureReason(approved ? null : "Mock gateway declined payments above " + failureThreshold)
                .amount(amount)
                .currency(string(body.getOrDefault("currency", "USD")))
                .processedAt(LocalDateTime.now())
                .build();
    }

    private BigDecimal decimal(Object value) {
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        if (value instanceof String text && !text.isBlank()) {
            return new BigDecimal(text);
        }
        return BigDecimal.ZERO;
    }

    private Long longValue(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Long.valueOf(text);
        }
        return null;
    }

    private String string(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
