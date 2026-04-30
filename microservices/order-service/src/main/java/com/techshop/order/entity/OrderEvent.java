package com.techshop.order.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Column(name = "order_number", nullable = false)
    private String orderNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus eventStatus;

    @Column(name = "previous_state")
    private String previousState;

    @Column(name = "new_state", nullable = false)
    private String newState;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum EventType {
        ORDER_CREATED,
        ORDER_UPDATED,
        ORDER_CANCELLED,
        ORDER_REFUNDED,
        PAYMENT_INITIATED,
        PAYMENT_COMPLETED,
        PAYMENT_FAILED,
        INVENTORY_RESERVED,
        INVENTORY_RELEASED,
        SHIPPING_INITIATED,
        DELIVERY_COMPLETED
    }

    public enum EventStatus {
        PENDING,
        PROCESSED,
        FAILED,
        COMPENSATED
    }
}