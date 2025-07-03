package com.trinca.chatseguro.dto;

import com.trinca.chatseguro.model.Message;

import java.time.LocalDateTime;
import java.util.UUID;

public class MessageDto {
    public UUID          id;
    public String        senderUsername;
    public String        receiverUsername;
    public String        encryptedAesKey;
    public String        encryptedMessage;
    public String        iv;
    public LocalDateTime timestamp;

    public static MessageDto fromEntity(Message m) {
        MessageDto dto = new MessageDto();
        dto.id               = m.getId();
        dto.senderUsername   = m.getSender().getUsername();
        dto.receiverUsername = m.getReceiver().getUsername();
        dto.encryptedAesKey  = m.getEncryptedAesKey();
        dto.encryptedMessage = m.getEncryptedMessage();
        dto.iv               = m.getIv();
        dto.timestamp        = m.getTimestamp();
        return dto;
    }
}
