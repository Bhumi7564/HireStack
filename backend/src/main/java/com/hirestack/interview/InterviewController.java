package com.hirestack.interview;

import com.hirestack.common.ApiResponse;
import com.hirestack.common.PagedResponse;
import com.hirestack.security.CustomUserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Tag(name = "Interviews", description = "Endpoints for scheduling, panel assignment, and interview calendar management")
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping
    @Operation(summary = "Search and filter scheduled interviews with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<InterviewDTO>>> getInterviews(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) InterviewStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scheduledStartTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDirection) {

        PagedResponse<InterviewDTO> response = interviewService.getInterviewsWithFilters(
                principal.getCompanyId(), status, search, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/my-interviews")
    @Operation(summary = "Get interviews assigned to the authenticated interviewer")
    public ResponseEntity<ApiResponse<List<InterviewDTO>>> getMyInterviews(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getAssignedInterviewsForUser(principal.getId())));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get all interviews for a specific application")
    public ResponseEntity<ApiResponse<List<InterviewDTO>>> getInterviewsByApplication(
            @PathVariable Long applicationId) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getInterviewsByApplication(applicationId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get interview details by ID")
    public ResponseEntity<ApiResponse<InterviewDTO>> getInterviewById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(interviewService.getInterviewById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Schedule an interview with panel conflict validation")
    public ResponseEntity<ApiResponse<InterviewDTO>> scheduleInterview(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody ScheduleInterviewRequest request) {
        InterviewDTO created = interviewService.scheduleInterview(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Interview scheduled successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update interview status (e.g., COMPLETED, CANCELLED)")
    public ResponseEntity<ApiResponse<InterviewDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam InterviewStatus status) {
        InterviewDTO updated = interviewService.updateInterviewStatus(id, status);
        return ResponseEntity.ok(ApiResponse.ok("Interview status updated", updated));
    }
}

