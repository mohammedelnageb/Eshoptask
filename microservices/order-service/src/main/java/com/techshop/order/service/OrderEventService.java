package com.techshop.order.service;

import com.techshop.order.entity.OrderEvent;
import com.techshop.order.exception.OrderNotFoundException;
import com.techshop.order.repository.OrderEventRepository;
import com.techshop.order.repository.OrderRepository;
import com.techshop.order.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderEventService {

    private final OrderEventRepository orderEventRepository;
    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<OrderEvent> getEventsByOrderId(Long orderId) {
        var order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));

        if (!order.getTenantId().equals(TenantContext.getTenantId())) {
            throw new OrderNotFoundException("Order not found with id: " + orderId);
        }

        return orderEventRepository.findByOrderIdOrderByCreatedAtDesc(orderId);
    }
}
