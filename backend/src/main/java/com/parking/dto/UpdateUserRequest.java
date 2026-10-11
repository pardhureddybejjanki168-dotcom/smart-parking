package com.parking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateUserRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @Pattern(regexp = "^[+0-9\\-\\s()]{7,20}$", message = "Phone number must be valid")
    private String phone;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String fullName, String phone) {
        this.fullName = fullName;
        this.phone = phone;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String fullName;
        private String phone;

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UpdateUserRequest build() {
            return new UpdateUserRequest(fullName, phone);
        }
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
