package com.techshop.inventory.repository;

import com.techshop.inventory.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductId(Long productId);
    boolean existsByProductId(Long productId);
    List<Inventory> findByProductIdIn(List<Long> productIds);
    Page<Inventory> findByStockStatus(Inventory.StockStatus status, Pageable pageable);
}