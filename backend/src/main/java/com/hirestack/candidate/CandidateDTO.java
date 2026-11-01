package com.hirestack.candidate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CandidateDTO {
    private Long id;
    private Long companyId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String currentCompany;
    private String currentTitle;
    private BigDecimal experienceYears;
    private String location;
    private String skills;
    private String linkedinUrl;
    private String source;
    private String notes;
    private Long applicationCount;
    private Instant createdAt;
}

