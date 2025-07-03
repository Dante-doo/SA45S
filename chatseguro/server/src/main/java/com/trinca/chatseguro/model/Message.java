package com.trinca.chatseguro.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Column(nullable = false)
    @Size(max = 1000)
    private String encryptedAesKey; // AES cifrada com RSA

    @Column(nullable = false)
    @Size(max = 8000)
    private String encryptedMessage; // Mensagem cifrada com AES

//    @Column(nullable = false)
//    @Size(max = 1000)
//    private String hmac; // HMAC-SHA256 da mensagem

    @Column(nullable = false)
    @Size(max = 1000)
    private String iv;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    public Message(User sender, User receiver, String encryptedAesKey, String encryptedMessage, String iv, LocalDateTime timestamp) {
        this.sender = sender;
        this.receiver = receiver;
        this.encryptedAesKey = encryptedAesKey;
        this.encryptedMessage = encryptedMessage;
        this.iv = iv;
        this.timestamp = timestamp;
    }

    public Message() {

    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    public String getEncryptedAesKey() {
        return encryptedAesKey;
    }

    public void setEncryptedAesKey(String encryptedAesKey) {
        this.encryptedAesKey = encryptedAesKey;
    }

    public String getEncryptedMessage() {
        return encryptedMessage;
    }

    public void setEncryptedMessage(String encryptedMessage) {
        this.encryptedMessage = encryptedMessage;
    }
//
//    public String getHmac() {
//        return hmac;
//    }
//
//    public void setHmac(String hmac) {
//        this.hmac = hmac;
//    }

    public String getIv() {
        return iv;
    }

    public void setIv(String iv) {
        this.iv = iv;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
