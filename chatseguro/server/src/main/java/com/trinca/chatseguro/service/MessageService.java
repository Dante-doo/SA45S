package com.trinca.chatseguro.service;

import com.trinca.chatseguro.model.Message;
import com.trinca.chatseguro.model.User;
import com.trinca.chatseguro.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class MessageService {

    @Autowired
    private MessageRepository repo;

    /**
     * Retorna a “conversa” completa (enviadas e recebidas) entre dois users,
     * já ordenada por timestamp ascendente.
     */
    public List<Message> getConversation(User me, User other) {
        List<Message> sent     = repo.findBySenderAndReceiverOrderByTimestampAsc(me, other);
        List<Message> received = repo.findBySenderAndReceiverOrderByTimestampAsc(other, me);

        List<Message> all = new ArrayList<>();
        all.addAll(sent);
        all.addAll(received);
        // ordena a lista combinada
        all.sort(Comparator.comparing(Message::getTimestamp));
        return all;
    }
}
