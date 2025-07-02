package com.trinca.chatseguro.controller;

import com.trinca.chatseguro.dto.MessageDto;
import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.model.User;
import com.trinca.chatseguro.service.MessageService;
import com.trinca.chatseguro.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired private MessageService messageService;
    @Autowired private UserService    userService;

    @GetMapping("/conversation/{otherUsername}")
    public List<MessageDto> conversation(
            Principal principal,
            @PathVariable String otherUsername
    ) throws Exception {
        User me    = userService.findByUsername(principal.getName())
                .orElseThrow(() -> new Exception("me not found"));
        User other = userService.findByUsername(otherUsername)
                .orElseThrow(() -> new Exception("other not found"));

        return messageService.getConversation(me, other)
                .stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }
}
