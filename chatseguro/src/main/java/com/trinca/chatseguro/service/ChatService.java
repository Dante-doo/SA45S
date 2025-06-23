package com.trinca.chatseguro.service;

import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.model.User;
import com.trinca.chatseguro.repository.MessageRepository;
import com.trinca.chatseguro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message sendMessage(String senderUsername, String receiverUsername,
                               String encryptedAesKey, String encryptedMessage, String hmac) throws Exception {

        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new Exception("Sender not found"));

        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new Exception("Receiver not found"));

        Message message = new Message(sender, receiver, encryptedAesKey, encryptedMessage, hmac, LocalDateTime.now());
        return messageRepository.save(message);
    }

    public List<Message> getMessagesForUser(String username) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));
        return messageRepository.findByReceiver(user);
    }

    public List<Message> getMessagesSentByUser(String username) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));
        return messageRepository.findBySender(user);
    }

    public void deleteMessage(UUID id) {
        messageRepository.deleteById(id);
    }
}
