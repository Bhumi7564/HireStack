package com.hirestack.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PipelineStatsDTO {
    private String stage;
    private long count;
    private double percentageOfTotal;
}

