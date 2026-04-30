package com.techshop.order;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.techshop.order.dto.OrderDTO;
import com.techshop.order.dto.OrderItemDTO;
import com.techshop.order.service.OrderService;
import com.techshop.order.tenant.TenantContext;
import org.apache.kafka.clients.consumer.Consumer;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.test.utils.KafkaTestUtils;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.KafkaContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class OrderServiceIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("order_test")
            .withUsername("techshop")
            .withPassword("techshop");

    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.6.1"));

    @DynamicPropertySource
    static void configure(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri", () -> "http://localhost:8180/realms/techshop");
    }

    @Autowired
    private OrderService orderService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void cleanup() {
        TenantContext.clear();
    }

    @Test
    void createOrder_publishesContractedOrderAndPaymentSagaEvents() throws Exception {
        TenantContext.setTenantId("techshop");

        OrderDTO request = OrderDTO.builder()
                .userId(101L)
                .userEmail("user@techshop.com")
                .paymentMethod("CARD")
                .currency("USD")
                .items(List.of(
                        OrderItemDTO.builder()
                                .productId(1L)
                                .productName("Keyboard")
                                .productSku("KB-001")
                                .quantity(2)
                                .unitPrice(new BigDecimal("50.00"))
                                .totalPrice(new BigDecimal("100.00"))
                                .build()
                ))
                .build();

        OrderDTO created = orderService.createOrder(request);
        assertNotNull(created.getOrderNumber());

        try (Consumer<String, String> orderConsumer = createConsumer("order-events");
             Consumer<String, String> paymentConsumer = createConsumer("payment-commands")) {

            ConsumerRecord<String, String> orderEvent = pollSingleRecord(orderConsumer);
            ConsumerRecord<String, String> paymentCommand = pollSingleRecord(paymentConsumer);

            JsonNode orderJson = objectMapper.readTree(orderEvent.value());
            assertEquals("ORDER_CREATED", orderJson.get("eventType").asText());
            assertEquals(1, orderJson.get("schemaVersion").asInt());
            assertEquals("techshop", orderJson.get("tenantId").asText());

            JsonNode paymentJson = objectMapper.readTree(paymentCommand.value());
            assertEquals("PAYMENT_INITIATED", paymentJson.get("eventType").asText());
            assertEquals(created.getOrderNumber(), paymentJson.get("aggregateId").asText());
            assertEquals("CARD", paymentJson.get("payload").get("paymentMethod").asText());
        }
    }

    private Consumer<String, String> createConsumer(String topic) {
        Map<String, Object> consumerProps = KafkaTestUtils.consumerProps("it-" + UUID.randomUUID(), "false", kafka.getBootstrapServers());
        consumerProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        DefaultKafkaConsumerFactory<String, String> cf =
                new DefaultKafkaConsumerFactory<>(consumerProps, new StringDeserializer(), new StringDeserializer());
        Consumer<String, String> consumer = cf.createConsumer();
        consumer.subscribe(List.of(topic));
        return consumer;
    }

    private ConsumerRecord<String, String> pollSingleRecord(Consumer<String, String> consumer) {
        ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(10));
        assertFalse(records.isEmpty(), "Expected at least one Kafka record");
        return records.iterator().next();
    }
}
