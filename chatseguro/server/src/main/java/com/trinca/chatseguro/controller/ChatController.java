package com.trinca.chatseguro.controller;

import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * @deprecated Este endpoint foi substituído pelo WebSocket em WebSocketChatController
     * para comunicação em tempo real. Mantido para fins de teste ou fallback.
     */
    @Deprecated
    @PostMapping("/send")
    @ResponseStatus(HttpStatus.CREATED)
    public Message sendMessage(@RequestBody Map<String, String> body, Principal principal) throws Exception {
        String receiver = body.get("receiver");
        String encryptedAesKey = body.get("encryptedAesKey");
        String encryptedMessage = body.get("encryptedMessage");
        String iv = body.get("iv"); // <-- ADICIONADO
        String hmac = body.get("hmac");

        // Adiciona a verificação para o novo campo 'iv'
        if (receiver == null || encryptedAesKey == null || encryptedMessage == null || iv == null || hmac == null) {
            throw new IllegalArgumentException("Missing fields in message body");
        }

        // --- ATUALIZAÇÃO DA CHAMADA AO SERVIÇO ---
        return chatService.sendMessage(
                principal.getName(),
                receiver,
                encryptedAesKey,
                encryptedMessage,
                iv
        );
    }

    // Os outros endpoints (/inbox, /sent, /delete) continuam válidos e úteis
    // para carregar o histórico de mensagens ou gerenciar mensagens salvas.

    @GetMapping("/inbox")
    public List<Message> inbox(Principal principal) throws Exception {
        System.out.println("Usuário autenticado: " + principal.getName());
        return chatService.getMessagesForUser(principal.getName());
    }

    @GetMapping("/sent")
    public List<Message> sent(Principal principal) throws Exception {
        return chatService.getMessagesSentByUser(principal.getName());
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable UUID id, Principal principal) throws Exception {
        chatService.deleteMessage(id, principal.getName());
    }
}