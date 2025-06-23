package com.trinca.chatseguro.controller;

import com.trinca.chatseguro.model.User;
import com.trinca.chatseguro.service.JwtService;
import com.trinca.chatseguro.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public User register(@RequestBody Map<String, String> body) throws Exception {
        String username = body.get("username");
        String password = body.get("password");
        String publicKey = body.get("publicKey");

        return userService.register(username, password, publicKey);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> body) throws Exception {
        String username = body.get("username");
        String password = body.get("password");

        User user = userService.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new Exception("Invalid credentials");
        }

        String token = jwtService.generateToken(username);

        return Map.of("token", token);
    }

    @GetMapping("/me")
    public User me(Principal principal) throws Exception {
        return userService.findByUsername(principal.getName())
                .orElseThrow(() -> new Exception("User not found"));
    }

    @GetMapping("/public-key/{username}")
    public String getPublicKey(@PathVariable String username) throws Exception {
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        return user.getPublicKey();
    }
}
