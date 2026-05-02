package com.techshop.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Value("${techshop.security.permit-all:true}")
    private boolean permitAll;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        ServerHttpSecurity security = http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .authorizeExchange(exchange -> {
                    exchange
                        .pathMatchers("/actuator/**").permitAll()
                        .pathMatchers("/api/v1/auth/**").permitAll()
                        .pathMatchers("/swagger-ui/**", "/v3/api-docs/**", "/api-docs/**").permitAll();
                    if (permitAll) {
                        exchange.anyExchange().permitAll();
                    } else {
                        exchange.anyExchange().authenticated();
                    }
                });

        if (!permitAll) {
            security.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
        }

        return security.build();
    }
}
