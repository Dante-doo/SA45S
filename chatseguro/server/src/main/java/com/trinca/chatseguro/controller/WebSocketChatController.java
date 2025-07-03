package com.trinca.chatseguro.controller;

import com.trinca.chatseguro.dto.SendMessageDto;
import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
public class WebSocketChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessageDto messageDto, Principal principal) throws Exception {
        String senderUsername = principal.getName();

        Message savedMessage = chatService.sendMessage(
                senderUsername,
                messageDto.getReceiver(),
                messageDto.getEncryptedAesKey(),
                messageDto.getEncryptedMessage(),
                messageDto.getIv()
        );

        String destination = "/topic/messages/" + messageDto.getReceiver();

        System.out.println("BACKEND: Enviando mensagem para o tópico: [" + destination + "]");

        messagingTemplate.convertAndSend(destination, savedMessage);
    }
}