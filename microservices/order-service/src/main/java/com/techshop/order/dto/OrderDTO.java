package com.techshop.order.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long id;
    private String tenantId;
    private String orderNumber;
    private Long userId;
    private String userEmail;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal shippingAmount;
    private BigDecimal grandTotal;
    private String currency;
    private List<OrderItemDTO> items;
    private String shippingAddress;
    private String billingAddress;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentReference;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}