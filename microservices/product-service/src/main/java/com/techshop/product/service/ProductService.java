package com.techshop.product.service;

import com.techshop.product.dto.ProductDTO;
import com.techshop.product.entity.Product;
import com.techshop.product.exception.ProductNotFoundException;
import com.techshop.product.exception.InvalidProductException;
import com.techshop.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        log.debug("Fetching product with id: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        return mapToDTO(product);
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductBySku(String sku) {
        log.debug("Fetching product with sku: {}", sku);
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with sku: " + sku));
        return mapToDTO(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        log.debug("Fetching all products, page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findByActiveTrue(pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProducts(String category, String search, Pageable pageable) {
        log.debug("Fetching products, category: {}, search: {}, page: {}, size: {}",
                category, search, pageable.getPageNumber(), pageable.getPageSize());
        return productRepository.findActiveProducts(category, search, pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByCategory(String category, Pageable pageable) {
        log.debug("Fetching products by category: {}", category);
        return productRepository.findByCategory(category, pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getProductsByBrand(String brand, Pageable pageable) {
        log.debug("Fetching products by brand: {}", brand);
        return productRepository.findByBrand(brand, pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getFeaturedProducts(Pageable pageable) {
        log.debug("Fetching featured products");
        return productRepository.findByFeaturedTrue(pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        log.debug("Fetching all categories");
        return productRepository.findAllCategories();
    }

    @Transactional(readOnly = true)
    public List<String> getBrandsByCategory(String category) {
        log.debug("Fetching brands for category: {}", category);
        return productRepository.findBrandsByCategory(category);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(String search, Pageable pageable) {
        log.debug("Searching products with query: {}", search);
        return productRepository.searchProducts(search, pageable).map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getProductsByIds(List<Long> ids) {
        log.debug("Fetching products by ids: {}", ids);
        return productRepository.findByIds(ids).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO productDTO) {
        log.debug("Creating new product: {}", productDTO.getName());
        
        if (productRepository.existsBySku(productDTO.getSku())) {
            throw new InvalidProductException("Product with SKU already exists: " + productDTO.getSku());
        }
        
        Product product = mapToEntity(productDTO);
        Product savedProduct = productRepository.save(product);
        log.info("Product created with id: {}", savedProduct.getId());
        
        return mapToDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO productDTO) {
        log.debug("Updating product with id: {}", id);
        
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        if (!existingProduct.getSku().equals(productDTO.getSku()) && 
            productRepository.existsBySku(productDTO.getSku())) {
            throw new InvalidProductException("Product with SKU already exists: " + productDTO.getSku());
        }
        
        updateProductFromDTO(existingProduct, productDTO);
        Product updatedProduct = productRepository.save(existingProduct);
        log.info("Product updated with id: {}", updatedProduct.getId());
        
        return mapToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        log.debug("Deleting product with id: {}", id);
        
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + id));
        
        product.setActive(false);
        productRepository.save(product);
        log.info("Product soft deleted with id: {}", id);
    }

    @Transactional
    public void updateProductRating(Long productId, Double newRating, Integer reviewCount) {
        log.debug("Updating rating for product: {}", productId);
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException("Product not found with id: " + productId));
        
        product.setAverageRating(newRating);
        product.setReviewCount(reviewCount);
        productRepository.save(product);
    }

    private ProductDTO mapToDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .discountedPrice(product.getDiscountedPrice())
                .brand(product.getBrand())
                .category(product.getCategory())
                .subCategory(product.getSubCategory())
                .imageUrl(product.getImageUrl())
                .thumbnailUrl(product.getThumbnailUrl())
                .images(product.getImages())
                .active(product.getActive())
                .featured(product.getFeatured())
                .averageRating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private Product mapToEntity(ProductDTO dto) {
        return Product.builder()
                .sku(dto.getSku())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .discountedPrice(dto.getDiscountedPrice())
                .brand(dto.getBrand())
                .category(dto.getCategory())
                .subCategory(dto.getSubCategory())
                .imageUrl(dto.getImageUrl())
                .thumbnailUrl(dto.getThumbnailUrl())
                .images(dto.getImages())
                .active(dto.getActive() != null ? dto.getActive() : true)
                .featured(dto.getFeatured() != null ? dto.getFeatured() : false)
                .averageRating(dto.getAverageRating() != null ? dto.getAverageRating() : 0.0)
                .reviewCount(dto.getReviewCount() != null ? dto.getReviewCount() : 0)
                .build();
    }

    private void updateProductFromDTO(Product product, ProductDTO dto) {
        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) product.setPrice(dto.getPrice());
        if (dto.getDiscountedPrice() != null) product.setDiscountedPrice(dto.getDiscountedPrice());
        if (dto.getBrand() != null) product.setBrand(dto.getBrand());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());
        if (dto.getSubCategory() != null) product.setSubCategory(dto.getSubCategory());
        if (dto.getImageUrl() != null) product.setImageUrl(dto.getImageUrl());
        if (dto.getThumbnailUrl() != null) product.setThumbnailUrl(dto.getThumbnailUrl());
        if (dto.getImages() != null) product.setImages(dto.getImages());
        if (dto.getActive() != null) product.setActive(dto.getActive());
        if (dto.getFeatured() != null) product.setFeatured(dto.getFeatured());
    }
}
