package com.hirestack.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SourceStatsDTO {
    private String source;
    private long candidateCount;
    private long hiredCount;
    private double conversionRatePercentage;
}

