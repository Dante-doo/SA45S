package com.trinca.chatseguro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    // NÃO PRECISAMOS MAIS DO INTERCEPTOR. Pode remover o @Autowired e o método configureClientInboundChannel.

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                // MUDANÇA IMPORTANTE AQUI: Adicione o HandshakeHandler
                .setHandshakeHandler(new UserHandshakeHandler())
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://192.168.160.152:5173" // Mantenha os IPs necessários
                )
                .withSockJS();
    }
}