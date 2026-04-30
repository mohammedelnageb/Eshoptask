package com.techshop.product.config;

import com.techshop.product.entity.Product;
import com.techshop.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ProductDataInitializer {

    private final ProductRepository productRepository;

    @Bean
    public CommandLineRunner seedProducts() {
        return args -> {
            if (productRepository.count() > 0) {
                return;
            }

            productRepository.saveAll(List.of(
                    product("LAP-XPS-13", "Dell XPS 13 Plus", "Compact ultrabook with OLED display and Intel Core performance.",
                            "Dell", "Laptops", "Ultrabooks", "1299.00", "1199.00", true,
                            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"),
                    product("PHN-IP-15", "iPhone 15 Pro", "Titanium smartphone with advanced camera system and fast mobile performance.",
                            "Apple", "Smartphones", "Flagship Phones", "999.00", "949.00", true,
                            "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80"),
                    product("AUD-WH-1000", "Sony WH-1000XM5", "Wireless noise-canceling headphones with long battery life.",
                            "Sony", "Audio", "Headphones", "399.00", "349.00", true,
                            "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=80"),
                    product("TAB-IPAD-AIR", "iPad Air", "Lightweight tablet for work, study, drawing, and entertainment.",
                            "Apple", "Tablets", "Creative Tablets", "599.00", "549.00", false,
                            "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80"),
                    product("CAM-EOS-R50", "Canon EOS R50", "Mirrorless camera kit for crisp photos and 4K creator video.",
                            "Canon", "Cameras", "Mirrorless", "679.00", "629.00", false,
                            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80"),
                    product("WCH-GALAXY-6", "Galaxy Watch 6", "Smartwatch with health tracking, notifications, and fitness modes.",
                            "Samsung", "Wearables", "Smartwatches", "299.00", "249.00", true,
                            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80")
            ));
        };
    }

    private Product product(String sku, String name, String description, String brand, String category,
                            String subCategory, String price, String discountedPrice, boolean featured,
                            String imageUrl) {
        return Product.builder()
                .sku(sku)
                .name(name)
                .description(description)
                .brand(brand)
                .category(category)
                .subCategory(subCategory)
                .price(new BigDecimal(price))
                .discountedPrice(new BigDecimal(discountedPrice))
                .featured(featured)
                .active(true)
                .averageRating(4.5)
                .reviewCount(24)
                .imageUrl(imageUrl)
                .thumbnailUrl(imageUrl)
                .images(List.of(imageUrl))
                .build();
    }
}
