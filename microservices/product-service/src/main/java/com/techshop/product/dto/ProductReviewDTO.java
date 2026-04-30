package com.techshop.product.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReviewDTO {
    private Long id;
    private Long productId;
    private Integer rating;
    private String title;
    private String comment;
    private String author;
    private LocalDateTime createdAt;
}
