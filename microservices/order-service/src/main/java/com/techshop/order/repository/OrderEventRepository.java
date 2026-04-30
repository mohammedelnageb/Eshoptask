package com.techshop.order.repository;

import com.techshop.order.entity.OrderEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderEventRepository extends JpaRepository<OrderEvent, Long> {
    List<OrderEvent> findByOrderIdOrderByCreatedAtDesc(Long orderId);
    Page<OrderEvent> findByOrderNumberOrderByCreatedAtDesc(String orderNumber, Pageable pageable);
}