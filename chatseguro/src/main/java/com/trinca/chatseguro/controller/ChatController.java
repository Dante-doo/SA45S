package com.trinca.chatseguro.controller;

import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
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

    @PostMapping("/send")
    public Message sendMessage(@RequestBody Map<String, String> body, Principal principal) throws Exception {
        String receiver = body.get("receiver");
        String encryptedAesKey = body.get("encryptedAesKey");
        String encryptedMessage = body.get("encryptedMessage");
        String hmac = body.get("hmac");

        return chatService.sendMessage(
                principal.getName(),
                receiver,
                encryptedAesKey,
                encryptedMessage,
                hmac
        );
    }

    @GetMapping("/inbox")
    public List<Message> inbox(Principal principal) throws Exception {
        return chatService.getMessagesForUser(principal.getName());
    }

    @GetMapping("/sent")
    public List<Message> sent(Principal principal) throws Exception {
        return chatService.getMessagesSentByUser(principal.getName());
    }

    @DeleteMapping("/delete/{id}")
    public void deleteMessage(@PathVariable UUID id) {
        chatService.deleteMessage(id);
    }
}
