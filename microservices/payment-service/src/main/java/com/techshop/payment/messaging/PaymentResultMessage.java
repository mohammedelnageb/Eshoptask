package com.techshop.payment.messaging;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PaymentResultMessage {
    private String orderNumber;
    private Long orderId;
    private String tenantId;
    private String status;
    private String paymentReference;
    private String failureReason;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime processedAt;
}
