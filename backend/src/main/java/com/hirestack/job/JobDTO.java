package com.hirestack.job;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JobDTO {
    private Long id;
    private Long companyId;
    private String companyName;
    private Long recruiterId;
    private String recruiterName;
    private String title;
    private String department;
    private String location;
    private String employmentType;
    private String experienceLevel;
    private String description;
    private String requirements;
    private String responsibilities;
    private BigDecimal salaryRangeMin;
    private BigDecimal salaryRangeMax;
    private JobStatus status;
    private Integer openingsCount;
    private Long applicationCount;
    private LocalDate postedDate;
    private LocalDate closingDate;
    private Instant createdAt;
}

