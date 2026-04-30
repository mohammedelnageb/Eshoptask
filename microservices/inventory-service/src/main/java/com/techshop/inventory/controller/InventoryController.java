package com.techshop.inventory.controller;

import com.techshop.inventory.dto.InventoryDTO;
import com.techshop.inventory.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
@Tag(name = "Inventory Management", description = "APIs for managing inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get inventory by product ID")
    public ResponseEntity<InventoryDTO> getInventoryByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(inventoryService.getInventoryByProductId(productId));
    }

    @PostMapping("/batch")
    @Operation(summary = "Get inventories by product IDs")
    public ResponseEntity<List<InventoryDTO>> getInventoriesByProductIds(@RequestBody List<Long> productIds) {
        return ResponseEntity.ok(inventoryService.getInventoriesByProductIds(productIds));
    }

    @GetMapping
    @Operation(summary = "Get all inventories")
    public ResponseEntity<Page<InventoryDTO>> getAllInventories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("productId").ascending());
        return ResponseEntity.ok(inventoryService.getAllInventories(pageable));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock inventories")
    public ResponseEntity<Page<InventoryDTO>> getLowStockInventories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(inventoryService.getLowStockInventories(pageable));
    }

    @PostMapping
    @Operation(summary = "Create inventory")
    public ResponseEntity<InventoryDTO> createInventory(@RequestBody InventoryDTO inventoryDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createInventory(inventoryDTO));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update inventory")
    public ResponseEntity<InventoryDTO> updateInventory(
            @PathVariable Long id,
            @RequestBody InventoryDTO inventoryDTO) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, inventoryDTO));
    }

    @PostMapping("/reserve")
    @Operation(summary = "Reserve stock")
    public ResponseEntity<InventoryDTO> reserveStock(
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.reserveStock(productId, quantity));
    }

    @PostMapping("/release")
    @Operation(summary = "Release stock")
    public ResponseEntity<InventoryDTO> releaseStock(
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.releaseStock(productId, quantity));
    }

    @PostMapping("/restock")
    @Operation(summary = "Restock product")
    public ResponseEntity<InventoryDTO> restockProduct(
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(inventoryService.restockProduct(productId, quantity));
    }
}