package com.techshop.order.messaging;

import lombok.Data;

@Data
public class PaymentResultMessage {
    private String eventId;
    private String tenantId;
    private String orderNumber;
    private String status;
    private String paymentReference;
    private String failureReason;
}
