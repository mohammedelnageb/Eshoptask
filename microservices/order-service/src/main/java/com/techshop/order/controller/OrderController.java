package com.techshop.order.controller;

import com.techshop.order.dto.OrderDTO;
import com.techshop.order.entity.Order;
import com.techshop.order.entity.OrderEvent;
import com.techshop.order.service.OrderEventService;
import com.techshop.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for managing orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderEventService orderEventService;

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    @PreAuthorize("hasAnyRole('ADMIN','USER','SUPPORT')")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number")
    @PreAuthorize("hasAnyRole('ADMIN','USER','SUPPORT')")
    public ResponseEntity<OrderDTO> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get orders by user ID")
    @PreAuthorize("hasAnyRole('ADMIN','USER','SUPPORT')")
    public ResponseEntity<Page<OrderDTO>> getOrdersByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId, pageable));
    }

    @GetMapping
    @Operation(summary = "Get all orders")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }

    @PostMapping
    @Operation(summary = "Create a new order")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<OrderDTO> createOrder(@RequestBody OrderDTO orderDTO) {
        OrderDTO created = orderService.createOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        return ResponseEntity.ok(orderService.updateOrderStatus(id, newStatus));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order")
    @PreAuthorize("hasAnyRole('ADMIN','USER')")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    @PostMapping("/{id}/payment/success")
    @Operation(summary = "Process payment success")
    @PreAuthorize("hasAnyRole('ADMIN','PAYMENT')")
    public ResponseEntity<Void> processPaymentSuccess(
            @PathVariable Long id,
            @RequestParam String paymentReference) {
        orderService.processPaymentSuccess(id, paymentReference);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/payment/failure")
    @Operation(summary = "Process payment failure")
    @PreAuthorize("hasAnyRole('ADMIN','PAYMENT')")
    public ResponseEntity<Void> processPaymentFailure(
            @PathVariable Long id,
            @RequestParam String reason) {
        orderService.processPaymentFailure(id, reason);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/events")
    @Operation(summary = "Get order event stream")
    @PreAuthorize("hasAnyRole('ADMIN','SUPPORT')")
    public ResponseEntity<java.util.List<OrderEvent>> getOrderEvents(@PathVariable Long id) {
        return ResponseEntity.ok(orderEventService.getEventsByOrderId(id));
    }
}