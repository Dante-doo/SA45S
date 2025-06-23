package com.trinca.chatseguro.service;

import com.trinca.chatseguro.model.User;
import com.trinca.chatseguro.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(String username, String rawPassword, String publicKey) throws Exception {
        if (userRepository.existsByUsername(username)) {
            throw new Exception("Username already exists.");
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);

        System.out.println("Senha hash gerada: " + hashedPassword);
        //TESTE

        User user = new User(username, hashedPassword, publicKey);
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean verifyPassword(String rawPassword, String hashedPassword) {
        return passwordEncoder.matches(rawPassword, hashedPassword);
    }
}
