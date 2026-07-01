package com.idk.Media_Sharing_App.user;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String email) {
        super("Email already in use: " + email);
    }
}