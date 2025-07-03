package com.trinca.chatseguro.config;

import com.sun.security.auth.UserPrincipal;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, WebSocketHandler wsHandler, Map<String, Object> attributes) {
        // Pega o Principal que já foi autenticado pelo JwtAuthFilter durante o handshake HTTP
        final Principal principal = request.getPrincipal();

        if (principal == null) {
            // Se não houver Principal, cria um anônimo para evitar NullPointerException,
            // mas a segurança do WebSocket irá barrá-lo de qualquer forma.
            return new UserPrincipal(UUID.randomUUID().toString());
        }

        // Retorna o Principal autenticado, que será associado à sessão WebSocket.
        return principal;
    }
}