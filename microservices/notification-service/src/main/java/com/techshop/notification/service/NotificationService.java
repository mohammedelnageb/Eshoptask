package com.techshop.notification.service;

import com.techshop.notification.dto.NotificationDTO;
import com.techshop.notification.entity.Notification;
import com.techshop.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public NotificationDTO getNotificationById(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        return mapToDTO(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NotificationDTO> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Transactional
    public NotificationDTO createNotification(NotificationDTO notificationDTO) {
        log.info("Creating notification for user: {}", notificationDTO.getUserId());
        
        Notification notification = mapToEntity(notificationDTO);
        notification.setStatus(Notification.NotificationStatus.PENDING);
        Notification saved = notificationRepository.save(notification);
        
        // In production, this would send the notification via email/SMS
        sendNotification(saved);
        
        return mapToDTO(saved);
    }

    @Transactional
    public NotificationDTO sendOrderConfirmation(Long userId, String email, String orderNumber) {
        NotificationDTO dto = NotificationDTO.builder()
                .userId(userId)
                .recipient(email)
                .type(Notification.NotificationType.ORDER_CONFIRMATION.name())
                .channel(Notification.NotificationChannel.EMAIL.name())
                .subject("Order Confirmation - " + orderNumber)
                .message("Your order " + orderNumber + " has been confirmed.")
                .build();
        
        return createNotification(dto);
    }

    @Transactional
    public NotificationDTO sendOrderShipped(Long userId, String email, String orderNumber, String trackingNumber) {
        NotificationDTO dto = NotificationDTO.builder()
                .userId(userId)
                .recipient(email)
                .type(Notification.NotificationType.ORDER_SHIPPED.name())
                .channel(Notification.NotificationChannel.EMAIL.name())
                .subject("Order Shipped - " + orderNumber)
                .message("Your order " + orderNumber + " has been shipped. Tracking: " + trackingNumber)
                .build();
        
        return createNotification(dto);
    }

    @Transactional
    public NotificationDTO sendPaymentConfirmation(Long userId, String email, String orderNumber, String amount) {
        NotificationDTO dto = NotificationDTO.builder()
                .userId(userId)
                .recipient(email)
                .type(Notification.NotificationType.PAYMENT_CONFIRMATION.name())
                .channel(Notification.NotificationChannel.EMAIL.name())
                .subject("Payment Confirmed - " + orderNumber)
                .message("Payment of " + amount + " for order " + orderNumber + " has been confirmed.")
                .build();
        
        return createNotification(dto);
    }

    @Transactional
    public NotificationDTO sendRestockAlert(String email, String productName) {
        NotificationDTO dto = NotificationDTO.builder()
                .recipient(email)
                .type(Notification.NotificationType.RESTOCK_ALERT.name())
                .channel(Notification.NotificationChannel.EMAIL.name())
                .subject("Product Back in Stock")
                .message(productName + " is now back in stock!")
                .build();
        
        return createNotification(dto);
    }

    private void sendNotification(Notification notification) {
        try {
            // Simulate sending notification
            log.info("Sending {} notification to {}", notification.getChannel(), notification.getRecipient());
            
            notification.setStatus(Notification.NotificationStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Failed to send notification", e);
            notification.setStatus(Notification.NotificationStatus.FAILED);
            notification.setErrorMessage(e.getMessage());
            notification.setRetryCount(notification.getRetryCount() + 1);
        }
        
        notification.setUpdatedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .recipient(notification.getRecipient())
                .type(notification.getType().name())
                .channel(notification.getChannel().name())
                .subject(notification.getSubject())
                .message(notification.getMessage())
                .status(notification.getStatus().name())
                .retryCount(notification.getRetryCount())
                .errorMessage(notification.getErrorMessage())
                .sentAt(notification.getSentAt())
                .createdAt(notification.getCreatedAt())
                .updatedAt(notification.getUpdatedAt())
                .build();
    }

    private Notification mapToEntity(NotificationDTO dto) {
        return Notification.builder()
                .userId(dto.getUserId())
                .recipient(dto.getRecipient())
                .type(dto.getType() != null ? Notification.NotificationType.valueOf(dto.getType()) : null)
                .channel(dto.getChannel() != null ? Notification.NotificationChannel.valueOf(dto.getChannel()) : Notification.NotificationChannel.EMAIL)
                .subject(dto.getSubject())
                .message(dto.getMessage())
                .retryCount(dto.getRetryCount() != null ? dto.getRetryCount() : 0)
                .build();
    }
}