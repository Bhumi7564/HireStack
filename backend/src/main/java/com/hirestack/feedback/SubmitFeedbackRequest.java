package com.hirestack.feedback;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SubmitFeedbackRequest {
    @NotNull(message = "Interview ID is required")
    private Long interviewId;

    @NotNull(message = "Overall rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer overallRating;

    private Integer technicalSkillsRating;
    private Integer communicationRating;
    private Integer problemSolvingRating;
    private Integer culturalFitRating;

    @NotNull(message = "Recommendation is required")
    private InterviewRecommendation recommendation;

    private String strengths;
    private String weaknesses;

    @NotBlank(message = "Summary comments are required")
    private String summaryComments;

    private List<EvaluationScoreDTO> criteriaScores;
}

