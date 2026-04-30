package com.techshop.inventory.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDTO {
    private Long id;
    private Long productId;
    private Integer availableQuantity;
    private Integer reservedQuantity;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private Integer maxStockLevel;
    private String stockStatus;
    private String warehouseLocation;
    private LocalDateTime lastRestockDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}