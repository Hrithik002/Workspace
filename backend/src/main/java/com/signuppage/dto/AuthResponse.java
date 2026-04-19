package com.signuppage.dto;

public class AuthResponse {

    private final boolean success;
    private final String message;
    private final String fullName;
    private final String email;

    public AuthResponse(boolean success, String message, String fullName, String email) {
        this.success = success;
        this.message = message;
        this.fullName = fullName;
        this.email = email;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }
}
