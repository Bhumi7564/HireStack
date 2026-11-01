package com.hirestack.recruiter;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterDTO {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Long companyId;
    private String department;
    private String title;
    private Integer maxActiveJobs;
    private Long activeJobsCount;
    private Instant createdAt;
}

