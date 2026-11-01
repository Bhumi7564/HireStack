package com.hirestack.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationScoreDTO {
    private Long id;
    private String criterionName;
    private Integer score;
    private BigDecimal weight;
    private String comments;
}

