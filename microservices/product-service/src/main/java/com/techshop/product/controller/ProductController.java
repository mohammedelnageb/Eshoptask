package com.techshop.product.controller;

import com.techshop.product.dto.ProductDTO;
import com.techshop.product.dto.ProductReviewDTO;
import com.techshop.product.service.ProductReviewService;
import com.techshop.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Product Management", description = "APIs for managing products")
public class ProductController {

    private final ProductService productService;
    private final ProductReviewService productReviewService;

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve a paginated list of all active products")
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Category filter") @RequestParam(required = false) String category,
            @Parameter(description = "Search query") @RequestParam(required = false) String search,
            @RequestParam(required = false) String query,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ProductDTO> products = productService.getProducts(category, search != null ? search : query, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve a specific product by its ID")
    public ResponseEntity<ProductDTO> getProductById(
            @Parameter(description = "Product ID") @PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get product by SKU", description = "Retrieve a specific product by its SKU")
    public ResponseEntity<ProductDTO> getProductBySku(
            @Parameter(description = "Product SKU") @PathVariable String sku) {
        ProductDTO product = productService.getProductBySku(sku);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get products by category", description = "Retrieve products filtered by category")
    public ResponseEntity<Page<ProductDTO>> getProductsByCategory(
            @Parameter(description = "Category name") @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductDTO> products = productService.getProductsByCategory(category, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/brand/{brand}")
    @Operation(summary = "Get products by brand", description = "Retrieve products filtered by brand")
    public ResponseEntity<Page<ProductDTO>> getProductsByBrand(
            @Parameter(description = "Brand name") @PathVariable String brand,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductDTO> products = productService.getProductsByBrand(brand, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products", description = "Retrieve a list of featured products")
    public ResponseEntity<Page<ProductDTO>> getFeaturedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> products = productService.getFeaturedProducts(pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/search")
    @Operation(summary = "Search products", description = "Search products by name or description")
    public ResponseEntity<Page<ProductDTO>> searchProducts(
            @Parameter(description = "Search query") @RequestParam(required = false) String q,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductDTO> products = productService.searchProducts(q != null ? q : query, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories", description = "Retrieve a list of all product categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/{category}/brands")
    @Operation(summary = "Get brands by category", description = "Retrieve brands available in a specific category")
    public ResponseEntity<List<String>> getBrandsByCategory(
            @Parameter(description = "Category name") @PathVariable String category) {
        List<String> brands = productService.getBrandsByCategory(category);
        return ResponseEntity.ok(brands);
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get product reviews", description = "Retrieve reviews for a product")
    public ResponseEntity<List<ProductReviewDTO>> getProductReviews(@PathVariable Long id) {
        return ResponseEntity.ok(productReviewService.getReviews(id));
    }

    @PostMapping("/{id}/reviews")
    @Operation(summary = "Add product review", description = "Create a review for a product")
    public ResponseEntity<ProductReviewDTO> addProductReview(
            @PathVariable Long id,
            @RequestBody ProductReviewDTO reviewDTO) {
        ProductReviewDTO created = productReviewService.addReview(id, reviewDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping
    @Operation(summary = "Create a new product", description = "Create a new product in the system")
    public ResponseEntity<ProductDTO> createProduct(@RequestBody ProductDTO productDTO) {
        ProductDTO created = productService.createProduct(productDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a product", description = "Update an existing product")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id, 
            @RequestBody ProductDTO productDTO) {
        ProductDTO updated = productService.updateProduct(id, productDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product", description = "Soft delete a product (set as inactive)")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/batch")
    @Operation(summary = "Get products by IDs", description = "Retrieve multiple products by their IDs")
    public ResponseEntity<List<ProductDTO>> getProductsByIds(@RequestBody List<Long> ids) {
        List<ProductDTO> products = productService.getProductsByIds(ids);
        return ResponseEntity.ok(products);
    }
}
