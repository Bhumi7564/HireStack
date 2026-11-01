package com.hirestack.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TimeToHireDTO {
    private Long jobId;
    private String jobTitle;
    private String department;
    private double averageDaysToHire;
    private long totalHired;
}

