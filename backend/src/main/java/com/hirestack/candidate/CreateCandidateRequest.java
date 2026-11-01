package com.hirestack.candidate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateCandidateRequest {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String currentCompany;
    private String currentTitle;
    private BigDecimal experienceYears;
    private String location;
    private String skills;
    private String linkedinUrl;

    @Builder.Default
    private String source = "CAREER_PORTAL";

    private String notes;
}

