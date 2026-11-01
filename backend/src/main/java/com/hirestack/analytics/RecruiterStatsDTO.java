package com.hirestack.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RecruiterStatsDTO {
    private Long recruiterId;
    private String recruiterName;
    private String department;
    private long activeJobs;
    private long totalApplications;
    private long interviewsConducted;
    private long hiredCount;
}

