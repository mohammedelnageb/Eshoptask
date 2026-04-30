package com.techshop.notification.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    @Id
    private String id;

    private Long userId;

    private String recipient;

    private NotificationType type;

    private NotificationChannel channel;

    private String subject;

    private String message;

    private NotificationStatus status;

    private Integer retryCount;

    private String errorMessage;

    private LocalDateTime sentAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum NotificationType {
        ORDER_CONFIRMATION,
        ORDER_SHIPPED,
        ORDER_DELIVERED,
        ORDER_CANCELLED,
        PAYMENT_CONFIRMATION,
        PAYMENT_FAILED,
        RESTOCK_ALERT,
        PASSWORD_RESET,
        EMAIL_VERIFICATION,
        ACCOUNT_CREATED
    }

    public enum NotificationChannel {
        EMAIL,
        SMS,
        PUSH,
        WEBHOOK
    }

    public enum NotificationStatus {
        PENDING,
        SENT,
        FAILED,
        CANCELLED
    }
}