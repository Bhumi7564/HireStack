package com.hirestack.application;

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
public class ApplicationDTO {
    private Long id;
    private Long jobId;
    private String jobTitle;
    private String department;
    private String location;
    private Long candidateId;
    private String candidateName;
    private String candidateEmail;
    private String candidatePhone;
    private String candidateSkills;
    private BigDecimal candidateExperienceYears;
    private String candidateCurrentCompany;
    private String candidateCurrentTitle;
    private String candidateLocation;
    private String candidateLinkedinUrl;
    private String candidateNotes;
    private ApplicationStatus currentStage;
    private Instant appliedDate;
    private String coverLetter;
    private Integer rating;
    private String rejectionReason;
    private Instant hiredDate;
    private Long recruiterId;
    private String recruiterName;
    private Instant createdAt;
}
