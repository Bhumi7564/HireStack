package com.hirestack.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FeedbackDTO {
    private Long id;
    private Long interviewId;
    private String interviewTitle;
    private Long interviewerId;
    private String interviewerName;
    private Integer overallRating;
    private Integer technicalSkillsRating;
    private Integer communicationRating;
    private Integer problemSolvingRating;
    private Integer culturalFitRating;
    private InterviewRecommendation recommendation;
    private String strengths;
    private String weaknesses;
    private String summaryComments;
    private Instant submittedAt;
    private List<EvaluationScoreDTO> scores;
}

