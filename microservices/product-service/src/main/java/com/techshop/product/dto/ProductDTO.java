package com.techshop.product.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private BigDecimal discountedPrice;
    private String brand;
    private String category;
    private String subCategory;
    private String imageUrl;
    private String thumbnailUrl;
    private List<String> images;
    private Boolean active;
    private Boolean featured;
    private Double averageRating;
    private Integer reviewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}