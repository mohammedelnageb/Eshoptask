package com.techshop.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.order.messaging.PaymentResultMessage;
import com.techshop.order.repository.OrderRepository;
import com.techshop.order.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSagaListener {

    private final ObjectMapper objectMapper;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @KafkaListener(topics = "payment-results", groupId = "order-service")
    public void onPaymentResult(String payload) {
        try {
            PaymentResultMessage message = objectMapper.readValue(payload, PaymentResultMessage.class);
            if (message.getOrderNumber() == null || message.getStatus() == null) {
                log.warn("Ignoring payment result with missing required fields: {}", payload);
                return;
            }

            String tenantId = (message.getTenantId() == null || message.getTenantId().isBlank())
                    ? TenantContext.DEFAULT_TENANT
                    : message.getTenantId();

            var orderOpt = orderRepository.findByOrderNumberAndTenantId(message.getOrderNumber(), tenantId);
            if (orderOpt.isEmpty()) {
                log.warn("Order not found for payment result orderNumber={}, tenantId={}", message.getOrderNumber(), tenantId);
                return;
            }

            Long orderId = orderOpt.get().getId();
            try {
                TenantContext.setTenantId(tenantId);
                if ("COMPLETED".equalsIgnoreCase(message.getStatus()) || "SUCCESS".equalsIgnoreCase(message.getStatus())) {
                    orderService.processPaymentSuccess(orderId, message.getPaymentReference());
                } else {
                    String reason = message.getFailureReason() != null ? message.getFailureReason() : "Payment failed";
                    orderService.processPaymentFailure(orderId, reason);
                }
            } finally {
                TenantContext.clear();
            }
        } catch (Exception ex) {
            log.error("Failed to process payment result message", ex);
        }
    }
}
