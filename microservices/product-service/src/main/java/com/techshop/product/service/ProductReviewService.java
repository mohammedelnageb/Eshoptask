package com.techshop.product.service;

import com.techshop.product.dto.ProductReviewDTO;
import com.techshop.product.entity.Product;
import com.techshop.product.entity.ProductReview;
import com.techshop.product.exception.InvalidProductException;
import com.techshop.product.exception.ProductNotFoundException;
import com.techshop.product.repository.ProductRepository;
import com.techshop.product.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductReviewService {

    private final ProductRepository productRepository;
    private final ProductReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<ProductReviewDTO> getReviews(Long productId) {
        ensureProductExists(productId);
        return reviewRepository.findByProductId(productId, Sort.by("createdAt").descending()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductReviewDTO addReview(Long productId, ProductReviewDTO reviewDTO) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));

        validateReview(reviewDTO);

        ProductReview review = ProductReview.builder()
                .product(product)
                .rating(reviewDTO.getRating())
                .title(reviewDTO.getTitle().trim())
                .comment(reviewDTO.getComment().trim())
                .author(reviewDTO.getAuthor() != null && !reviewDTO.getAuthor().isBlank()
                        ? reviewDTO.getAuthor().trim()
                        : "Customer")
                .build();

        ProductReview saved = reviewRepository.save(review);
        refreshProductRating(product);
        log.info("Review created for product: {}", productId);
        return mapToDTO(saved);
    }

    private void ensureProductExists(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException("Product not found with id: " + productId);
        }
    }

    private void validateReview(ProductReviewDTO reviewDTO) {
        if (reviewDTO.getRating() == null || reviewDTO.getRating() < 1 || reviewDTO.getRating() > 5) {
            throw new InvalidProductException("Review rating must be between 1 and 5");
        }
        if (reviewDTO.getTitle() == null || reviewDTO.getTitle().isBlank()) {
            throw new InvalidProductException("Review title is required");
        }
        if (reviewDTO.getComment() == null || reviewDTO.getComment().isBlank()) {
            throw new InvalidProductException("Review comment is required");
        }
    }

    private void refreshProductRating(Product product) {
        List<ProductReview> reviews = reviewRepository.findByProductId(product.getId(), Sort.by("createdAt").descending());
        double average = reviews.stream()
                .mapToInt(ProductReview::getRating)
                .average()
                .orElse(0.0);

        product.setAverageRating(Math.round(average * 10.0) / 10.0);
        product.setReviewCount(reviews.size());
        productRepository.save(product);
    }

    private ProductReviewDTO mapToDTO(ProductReview review) {
        return ProductReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProduct().getId())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .author(review.getAuthor())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
