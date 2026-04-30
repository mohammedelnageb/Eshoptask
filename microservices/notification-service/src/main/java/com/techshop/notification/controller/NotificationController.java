package com.techshop.notification.controller;

import com.techshop.notification.dto.NotificationDTO;
import com.techshop.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "APIs for managing notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID")
    public ResponseEntity<NotificationDTO> getNotificationById(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get notifications by user ID")
    public ResponseEntity<List<NotificationDTO>> getNotificationsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUserId(userId));
    }

    @GetMapping
    @Operation(summary = "Get all notifications")
    public ResponseEntity<Page<NotificationDTO>> getAllNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(notificationService.getAllNotifications(pageable));
    }

    @PostMapping
    @Operation(summary = "Create a notification")
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody NotificationDTO notificationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.createNotification(notificationDTO));
    }

    @PostMapping("/order-confirmation")
    @Operation(summary = "Send order confirmation")
    public ResponseEntity<NotificationDTO> sendOrderConfirmation(
            @RequestParam Long userId,
            @RequestParam String email,
            @RequestParam String orderNumber) {
        return ResponseEntity.ok(notificationService.sendOrderConfirmation(userId, email, orderNumber));
    }

    @PostMapping("/order-shipped")
    @Operation(summary = "Send order shipped notification")
    public ResponseEntity<NotificationDTO> sendOrderShipped(
            @RequestParam Long userId,
            @RequestParam String email,
            @RequestParam String orderNumber,
            @RequestParam String trackingNumber) {
        return ResponseEntity.ok(notificationService.sendOrderShipped(userId, email, orderNumber, trackingNumber));
    }

    @PostMapping("/payment-confirmation")
    @Operation(summary = "Send payment confirmation")
    public ResponseEntity<NotificationDTO> sendPaymentConfirmation(
            @RequestParam Long userId,
            @RequestParam String email,
            @RequestParam String orderNumber,
            @RequestParam String amount) {
        return ResponseEntity.ok(notificationService.sendPaymentConfirmation(userId, email, orderNumber, amount));
    }

    @PostMapping("/restock-alert")
    @Operation(summary = "Send restock alert")
    public ResponseEntity<NotificationDTO> sendRestockAlert(
            @RequestParam String email,
            @RequestParam String productName) {
        return ResponseEntity.ok(notificationService.sendRestockAlert(email, productName));
    }
}