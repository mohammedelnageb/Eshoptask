package com.techshop.inventory.service;

import com.techshop.inventory.dto.InventoryDTO;
import com.techshop.inventory.entity.Inventory;
import com.techshop.inventory.exception.InventoryNotFoundException;
import com.techshop.inventory.repository.InventoryRepository;
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
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Transactional(readOnly = true)
    public InventoryDTO getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));
        return mapToDTO(inventory);
    }

    @Transactional(readOnly = true)
    public List<InventoryDTO> getInventoriesByProductIds(List<Long> productIds) {
        return inventoryRepository.findByProductIdIn(productIds).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<InventoryDTO> getAllInventories(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<InventoryDTO> getLowStockInventories(Pageable pageable) {
        return inventoryRepository.findByStockStatus(Inventory.StockStatus.LOW_STOCK, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public InventoryDTO createInventory(InventoryDTO inventoryDTO) {
        log.info("Creating inventory for product: {}", inventoryDTO.getProductId());
        
        if (inventoryRepository.existsByProductId(inventoryDTO.getProductId())) {
            throw new IllegalArgumentException("Inventory already exists for product: " + inventoryDTO.getProductId());
        }
        
        Inventory inventory = mapToEntity(inventoryDTO);
        updateStockStatus(inventory);
        Inventory saved = inventoryRepository.save(inventory);
        
        return mapToDTO(saved);
    }

    @Transactional
    public InventoryDTO updateInventory(Long id, InventoryDTO inventoryDTO) {
        log.info("Updating inventory: {}", id);
        
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found with id: " + id));
        
        if (inventoryDTO.getAvailableQuantity() != null) {
            inventory.setAvailableQuantity(inventoryDTO.getAvailableQuantity());
        }
        if (inventoryDTO.getReservedQuantity() != null) {
            inventory.setReservedQuantity(inventoryDTO.getReservedQuantity());
        }
        if (inventoryDTO.getReorderPoint() != null) {
            inventory.setReorderPoint(inventoryDTO.getReorderPoint());
        }
        if (inventoryDTO.getReorderQuantity() != null) {
            inventory.setReorderQuantity(inventoryDTO.getReorderQuantity());
        }
        if (inventoryDTO.getWarehouseLocation() != null) {
            inventory.setWarehouseLocation(inventoryDTO.getWarehouseLocation());
        }
        
        updateStockStatus(inventory);
        return mapToDTO(inventoryRepository.save(inventory));
    }

    @Transactional
    public InventoryDTO reserveStock(Long productId, Integer quantity) {
        log.info("Reserving {} units for product: {}", quantity, productId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));
        
        if (inventory.getAvailableQuantity() < quantity) {
            throw new IllegalStateException("Insufficient stock for product: " + productId);
        }
        
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() - quantity);
        inventory.setReservedQuantity(inventory.getReservedQuantity() + quantity);
        updateStockStatus(inventory);
        
        return mapToDTO(inventoryRepository.save(inventory));
    }

    @Transactional
    public InventoryDTO releaseStock(Long productId, Integer quantity) {
        log.info("Releasing {} units for product: {}", quantity, productId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));
        
        inventory.setReservedQuantity(Math.max(0, inventory.getReservedQuantity() - quantity));
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
        updateStockStatus(inventory);
        
        return mapToDTO(inventoryRepository.save(inventory));
    }

    @Transactional
    public InventoryDTO restockProduct(Long productId, Integer quantity) {
        log.info("Restocking {} units for product: {}", quantity, productId);
        
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new InventoryNotFoundException("Inventory not found for product: " + productId));
        
        inventory.setAvailableQuantity(inventory.getAvailableQuantity() + quantity);
        inventory.setLastRestockDate(LocalDateTime.now());
        updateStockStatus(inventory);
        
        return mapToDTO(inventoryRepository.save(inventory));
    }

    private void updateStockStatus(Inventory inventory) {
        int available = inventory.getAvailableQuantity();
        
        if (available == 0) {
            inventory.setStockStatus(Inventory.StockStatus.OUT_OF_STOCK);
        } else if (available <= inventory.getReorderPoint()) {
            inventory.setStockStatus(Inventory.StockStatus.LOW_STOCK);
        } else {
            inventory.setStockStatus(Inventory.StockStatus.IN_STOCK);
        }
    }

    private InventoryDTO mapToDTO(Inventory inventory) {
        return InventoryDTO.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .availableQuantity(inventory.getAvailableQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .reorderPoint(inventory.getReorderPoint())
                .reorderQuantity(inventory.getReorderQuantity())
                .maxStockLevel(inventory.getMaxStockLevel())
                .stockStatus(inventory.getStockStatus().name())
                .warehouseLocation(inventory.getWarehouseLocation())
                .lastRestockDate(inventory.getLastRestockDate())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    private Inventory mapToEntity(InventoryDTO dto) {
        return Inventory.builder()
                .productId(dto.getProductId())
                .availableQuantity(dto.getAvailableQuantity() != null ? dto.getAvailableQuantity() : 0)
                .reservedQuantity(dto.getReservedQuantity() != null ? dto.getReservedQuantity() : 0)
                .reorderPoint(dto.getReorderPoint() != null ? dto.getReorderPoint() : 10)
                .reorderQuantity(dto.getReorderQuantity() != null ? dto.getReorderQuantity() : 50)
                .maxStockLevel(dto.getMaxStockLevel() != null ? dto.getMaxStockLevel() : 200)
                .warehouseLocation(dto.getWarehouseLocation())
                .build();
    }
}