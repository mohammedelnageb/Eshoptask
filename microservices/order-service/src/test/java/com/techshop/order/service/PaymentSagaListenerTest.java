package com.techshop.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.order.entity.Order;
import com.techshop.order.messaging.PaymentResultMessage;
import com.techshop.order.repository.OrderRepository;
import com.techshop.order.tenant.TenantContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentSagaListenerTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderService orderService;

    private ObjectMapper objectMapper;

    @InjectMocks
    private PaymentSagaListener paymentSagaListener;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        paymentSagaListener = new PaymentSagaListener(objectMapper, orderRepository, orderService);
    }

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void onPaymentResult_shouldProcessSuccessUsingMessageTenant() throws Exception {
        PaymentResultMessage message = new PaymentResultMessage();
        message.setOrderNumber("TS-123");
        message.setStatus("COMPLETED");
        message.setTenantId("brand-a");
        message.setPaymentReference("pay-1");

        Order order = Order.builder().id(10L).orderNumber("TS-123").tenantId("brand-a").build();
        when(orderRepository.findByOrderNumberAndTenantId("TS-123", "brand-a")).thenReturn(Optional.of(order));

        paymentSagaListener.onPaymentResult(objectMapper.writeValueAsString(message));

        verify(orderRepository).findByOrderNumberAndTenantId("TS-123", "brand-a");
        verify(orderService).processPaymentSuccess(10L, "pay-1");
    }

    @Test
    void onPaymentResult_shouldFallbackToDefaultTenant() throws Exception {
        PaymentResultMessage message = new PaymentResultMessage();
        message.setOrderNumber("TS-456");
        message.setStatus("FAILED");
        message.setFailureReason("Declined");

        when(orderRepository.findByOrderNumberAndTenantId("TS-456", TenantContext.DEFAULT_TENANT))
                .thenReturn(Optional.empty());

        paymentSagaListener.onPaymentResult(objectMapper.writeValueAsString(message));

        verify(orderRepository).findByOrderNumberAndTenantId("TS-456", TenantContext.DEFAULT_TENANT);
        verify(orderService, never()).processPaymentSuccess(eq(10L), anyString());
        verify(orderService, never()).processPaymentFailure(eq(10L), anyString());
    }
}
