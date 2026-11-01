package com.hirestack.feedback;

import com.hirestack.common.ApiResponse;
import com.hirestack.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@Tag(name = "Interview Feedback", description = "Endpoints for submitting interviewer evaluations, rubrics, and scores")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping("/interview/{interviewId}")
    @Operation(summary = "Get feedback entries for a scheduled interview")
    public ResponseEntity<ApiResponse<List<FeedbackDTO>>> getFeedbackByInterview(
            @PathVariable Long interviewId) {
        return ResponseEntity.ok(ApiResponse.ok(feedbackService.getFeedbackByInterview(interviewId)));
    }

    @PostMapping
    @Operation(summary = "Submit interview feedback and evaluation score rubric")
    public ResponseEntity<ApiResponse<FeedbackDTO>> submitFeedback(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody SubmitFeedbackRequest request) {
        FeedbackDTO created = feedbackService.submitFeedback(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Feedback submitted successfully", created), HttpStatus.CREATED);
    }
}

