package com.trinca.chatseguro.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String username) {
        super("User not found: " + username);
    }
}
