package com.hirestack.job;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateJobRequest {
    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Location is required")
    private String location;

    @Builder.Default
    private String employmentType = "FULL_TIME";

    @Builder.Default
    private String experienceLevel = "MID_LEVEL";

    @NotBlank(message = "Job description is required")
    private String description;

    private String requirements;
    private String responsibilities;

    private BigDecimal salaryRangeMin;
    private BigDecimal salaryRangeMax;

    private Long recruiterId;

    @Builder.Default
    private JobStatus status = JobStatus.OPEN;

    @NotNull(message = "Openings count is required")
    @Min(value = 1, message = "Openings count must be at least 1")
    @Builder.Default
    private Integer openingsCount = 1;

    private LocalDate closingDate;
}

