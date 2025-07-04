package com.trinca.chatseguro.repository;

import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByReceiver(User receiver);
    List<Message> findBySender(User sender);

    List<Message> findByReceiverOrderByTimestampAsc(User receiver);

    List<Message> findBySenderOrderByTimestampAsc(User sender);

    List<Message> findBySenderAndReceiverOrderByTimestampAsc(User sender, User receiver);
    List<Message> findByReceiverAndSenderOrderByTimestampAsc(User receiver, User sender);
}
