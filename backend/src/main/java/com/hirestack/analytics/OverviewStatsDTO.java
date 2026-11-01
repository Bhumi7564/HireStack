package com.hirestack.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OverviewStatsDTO {
    private long totalJobs;
    private long activeJobs;
    private long totalCandidates;
    private long totalApplications;
    private long activeInterviews;
    private long hiredCount;
    private double averageTimeToHireDays;
    private Map<String, Long> stageDistribution;
}

