package com.techshop.order.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.order.dto.OrderDTO;
import com.techshop.order.dto.OrderItemDTO;
import com.techshop.order.entity.Order;
import com.techshop.order.entity.OrderEvent;
import com.techshop.order.entity.OrderItem;
import com.techshop.order.exception.OrderNotFoundException;
import com.techshop.order.messaging.OrderEventMessage;
import com.techshop.order.repository.OrderRepository;
import com.techshop.order.repository.OrderEventRepository;
import com.techshop.order.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private static final String ORDER_EVENTS_TOPIC = "order-events";
    private static final String PAYMENT_COMMANDS_TOPIC = "payment-commands";
    private static final int EVENT_SCHEMA_VERSION = 1;

    private final OrderRepository orderRepository;
    private final OrderEventRepository orderEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        String tenantId = TenantContext.getTenantId();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        if (!order.getTenantId().equals(tenantId)) {
            throw new OrderNotFoundException("Order not found with id: " + id);
        }
        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public OrderDTO getOrderByNumber(String orderNumber) {
        String tenantId = TenantContext.getTenantId();
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with number: " + orderNumber));
        if (!order.getTenantId().equals(tenantId)) {
            throw new OrderNotFoundException("Order not found with number: " + orderNumber);
        }
        return mapToDTO(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByUserId(Long userId, Pageable pageable) {
        return orderRepository.findByTenantIdAndUserId(TenantContext.getTenantId(), userId, pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findByTenantId(TenantContext.getTenantId(), pageable).map(this::mapToDTO);
    }

    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        log.info("Creating new order for user: {}", orderDTO.getUserId());
        validateOrder(orderDTO);
        
        Order order = mapToEntity(orderDTO);
        order.setTenantId(TenantContext.getTenantId());
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(Order.OrderStatus.PENDING);
        
        // Calculate totals
        BigDecimal total = order.getItems().stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
        order.setGrandTotal(calculateGrandTotal(order));
        
        Order savedOrder = orderRepository.save(order);
        
        // Record event for event sourcing
        recordEvent(savedOrder.getId(), savedOrder.getOrderNumber(), 
                OrderEvent.EventType.ORDER_CREATED, OrderEvent.EventStatus.PROCESSED,
                null, Order.OrderStatus.PENDING.name(), orderDTO.getUserId());
        
        // Publish to Kafka
        publishOrderEvent(savedOrder, OrderEvent.EventType.ORDER_CREATED.name());

        // Saga step: initiate payment asynchronously
        recordEvent(savedOrder.getId(), savedOrder.getOrderNumber(),
                OrderEvent.EventType.PAYMENT_INITIATED, OrderEvent.EventStatus.PENDING,
                Order.OrderStatus.PENDING.name(), Order.OrderStatus.PENDING.name(), savedOrder.getUserId());
        publishPaymentCommand(savedOrder);
        
        log.info("Order created with number: {}", savedOrder.getOrderNumber());
        return mapToDTO(savedOrder);
    }

    private void validateOrder(OrderDTO orderDTO) {
        if (orderDTO.getUserId() == null) {
            throw new IllegalArgumentException("User id is required");
        }
        if (orderDTO.getItems() == null || orderDTO.getItems().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }
        boolean hasInvalidItem = orderDTO.getItems().stream().anyMatch(item ->
                item.getProductId() == null
                        || item.getProductName() == null
                        || item.getProductName().isBlank()
                        || item.getQuantity() == null
                        || item.getQuantity() < 1
                        || item.getUnitPrice() == null);
        if (hasInvalidItem) {
            throw new IllegalArgumentException("Order items must include product id, name, quantity, and unit price");
        }
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, Order.OrderStatus newStatus) {
        log.info("Updating order {} status to {}", id, newStatus);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        if (!order.getTenantId().equals(TenantContext.getTenantId())) {
            throw new OrderNotFoundException("Order not found with id: " + id);
        }
        
        Order.OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        
        // Record event
        recordEvent(id, order.getOrderNumber(), OrderEvent.EventType.ORDER_UPDATED,
                OrderEvent.EventStatus.PROCESSED, previousStatus.name(), newStatus.name(), order.getUserId());
        
        // Publish to Kafka
        publishOrderEvent(updatedOrder, OrderEvent.EventType.ORDER_UPDATED.name());
        
        return mapToDTO(updatedOrder);
    }

    @Transactional
    public OrderDTO cancelOrder(Long id) {
        log.info("Cancelling order: {}", id);
        
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + id));
        if (!order.getTenantId().equals(TenantContext.getTenantId())) {
            throw new OrderNotFoundException("Order not found with id: " + id);
        }
        
        if (order.getStatus() == Order.OrderStatus.DELIVERED || order.getStatus() == Order.OrderStatus.SHIPPED) {
            throw new IllegalStateException("Cannot cancel order that has been shipped or delivered");
        }
        
        Order.OrderStatus previousStatus = order.getStatus();
        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        
        // Record event
        recordEvent(id, order.getOrderNumber(), OrderEvent.EventType.ORDER_CANCELLED,
                OrderEvent.EventStatus.PROCESSED, previousStatus.name(), 
                Order.OrderStatus.CANCELLED.name(), order.getUserId());
        
        // Publish to Kafka for inventory release
        publishOrderEvent(cancelledOrder, OrderEvent.EventType.ORDER_CANCELLED.name());
        
        return mapToDTO(cancelledOrder);
    }

    @Transactional
    public void processPaymentSuccess(Long orderId, String paymentReference) {
        log.info("Processing payment success for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
        if (!order.getTenantId().equals(TenantContext.getTenantId())) {
            throw new OrderNotFoundException("Order not found with id: " + orderId);
        }
        
        order.setPaymentStatus("COMPLETED");
        order.setPaymentReference(paymentReference);
        order.setStatus(Order.OrderStatus.CONFIRMED);
        orderRepository.save(order);
        
        recordEvent(orderId, order.getOrderNumber(), OrderEvent.EventType.PAYMENT_COMPLETED,
                OrderEvent.EventStatus.PROCESSED, null, "CONFIRMED", order.getUserId());
        
        publishOrderEvent(order, OrderEvent.EventType.PAYMENT_COMPLETED.name());
    }

    @Transactional
    public void processPaymentFailure(Long orderId, String reason) {
        log.info("Processing payment failure for order: {}", orderId);
        
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
        if (!order.getTenantId().equals(TenantContext.getTenantId())) {
            throw new OrderNotFoundException("Order not found with id: " + orderId);
        }
        
        order.setPaymentStatus("FAILED");
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
        
        recordEvent(orderId, order.getOrderNumber(), OrderEvent.EventType.PAYMENT_FAILED,
                OrderEvent.EventStatus.PROCESSED, null, "CANCELLED", order.getUserId());
        
        publishOrderEvent(order, OrderEvent.EventType.PAYMENT_FAILED.name());
    }

    private void recordEvent(Long orderId, String orderNumber, OrderEvent.EventType eventType,
                            OrderEvent.EventStatus status, String previousState, String newState, Long userId) {
        OrderEvent event = OrderEvent.builder()
                .orderId(orderId)
                .orderNumber(orderNumber)
                .eventType(eventType)
                .eventStatus(status)
                .previousState(previousState)
                .newState(newState)
                .userId(userId)
                .build();
        orderEventRepository.save(event);
    }

    private void publishOrderEvent(Order order, String eventType) {
        try {
            String payload = objectMapper.writeValueAsString(buildEventMessage(order, eventType, buildOrderPayload(order)));
            kafkaTemplate.send(ORDER_EVENTS_TOPIC, order.getOrderNumber(), payload);
            log.debug("Published order event: {}", eventType);
        } catch (JsonProcessingException e) {
            log.error("Error serializing order event", e);
        }
    }

    private void publishPaymentCommand(Order order) {
        try {
            Map<String, Object> commandPayload = new LinkedHashMap<>();
            commandPayload.put("orderNumber", order.getOrderNumber());
            commandPayload.put("orderId", order.getId());
            commandPayload.put("userId", order.getUserId());
            commandPayload.put("amount", order.getGrandTotal());
            commandPayload.put("currency", order.getCurrency());
            commandPayload.put("paymentMethod", order.getPaymentMethod());

            String payload = objectMapper.writeValueAsString(buildEventMessage(
                    order,
                    OrderEvent.EventType.PAYMENT_INITIATED.name(),
                    commandPayload
            ));
            kafkaTemplate.send(PAYMENT_COMMANDS_TOPIC, order.getOrderNumber(), payload);
            log.debug("Published payment command for order: {}", order.getOrderNumber());
        } catch (JsonProcessingException e) {
            log.error("Error serializing payment command", e);
        }
    }

    private OrderEventMessage buildEventMessage(Order order, String eventType, Map<String, Object> payload) {
        return OrderEventMessage.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .tenantId(order.getTenantId())
                .aggregateId(order.getOrderNumber())
                .occurredAt(LocalDateTime.now())
                .schemaVersion(EVENT_SCHEMA_VERSION)
                .payload(payload)
                .build();
    }

    private Map<String, Object> buildOrderPayload(Order order) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", order.getId());
        payload.put("orderNumber", order.getOrderNumber());
        payload.put("userId", order.getUserId());
        payload.put("status", order.getStatus().name());
        payload.put("paymentStatus", order.getPaymentStatus());
        payload.put("grandTotal", order.getGrandTotal());
        payload.put("currency", order.getCurrency());
        payload.put("createdAt", order.getCreatedAt());
        return payload;
    }

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "TS-" + timestamp + "-" + uuid;
    }

    private BigDecimal calculateGrandTotal(Order order) {
        BigDecimal subtotal = order.getTotalAmount();
        BigDecimal tax = order.getTaxAmount() != null ? order.getTaxAmount() : BigDecimal.ZERO;
        BigDecimal shipping = order.getShippingAmount() != null ? order.getShippingAmount() : BigDecimal.ZERO;
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        
        return subtotal.add(tax).add(shipping).subtract(discount);
    }

    private OrderDTO mapToDTO(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .tenantId(order.getTenantId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUserId())
                .userEmail(order.getUserEmail())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .taxAmount(order.getTaxAmount())
                .shippingAmount(order.getShippingAmount())
                .grandTotal(order.getGrandTotal())
                .currency(order.getCurrency())
                .items(order.getItems().stream().map(this::mapItemToDTO).collect(Collectors.toList()))
                .shippingAddress(order.getShippingAddress())
                .billingAddress(order.getBillingAddress())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .paymentReference(order.getPaymentReference())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemDTO mapItemToDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productSku(item.getProductSku())
                .productName(item.getProductName())
                .productImageUrl(item.getProductImageUrl())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .discount(item.getDiscount())
                .build();
    }

    private Order mapToEntity(OrderDTO dto) {
        Order order = Order.builder()
                .tenantId(dto.getTenantId())
                .userId(Objects.requireNonNull(dto.getUserId(), "User id is required"))
                .userEmail(dto.getUserEmail())
                .totalAmount(dto.getTotalAmount())
                .discountAmount(dto.getDiscountAmount())
                .taxAmount(dto.getTaxAmount())
                .shippingAmount(dto.getShippingAmount())
                .grandTotal(dto.getGrandTotal())
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "USD")
                .shippingAddress(dto.getShippingAddress())
                .billingAddress(dto.getBillingAddress())
                .paymentMethod(dto.getPaymentMethod())
                .paymentStatus(dto.getPaymentStatus() != null ? dto.getPaymentStatus() : "PENDING")
                .paymentReference(dto.getPaymentReference())
                .notes(dto.getNotes())
                .build();
        
        if (dto.getItems() != null) {
            order.setItems(dto.getItems().stream()
                    .map(itemDTO -> mapItemToEntity(itemDTO, order))
                    .collect(Collectors.toList()));
        }
        
        return order;
    }

    private OrderItem mapItemToEntity(OrderItemDTO dto, Order order) {
        BigDecimal unitPrice = Objects.requireNonNull(dto.getUnitPrice(), "Unit price is required");
        Integer quantity = Objects.requireNonNull(dto.getQuantity(), "Quantity is required");
        return OrderItem.builder()
                .order(order)
                .productId(dto.getProductId())
                .productSku(dto.getProductSku())
                .productName(dto.getProductName())
                .productImageUrl(dto.getProductImageUrl())
                .quantity(quantity)
                .unitPrice(unitPrice)
                .totalPrice(dto.getTotalPrice() != null ? dto.getTotalPrice() : unitPrice.multiply(BigDecimal.valueOf(quantity)))
                .discount(dto.getDiscount() != null ? dto.getDiscount() : BigDecimal.ZERO)
                .build();
    }
}
