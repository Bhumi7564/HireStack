package com.hirestack.application;

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
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
@Tag(name = "Applications & Pipeline", description = "Endpoints for applications, pipeline movements, and stage history")
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    @Operation(summary = "Search and filter candidate applications with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ApplicationDTO>>> getApplications(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) ApplicationStatus stage,
            @RequestParam(required = false) Long recruiterId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        PagedResponse<ApplicationDTO> response = applicationService.getApplicationsWithFilters(
                principal.getCompanyId(), jobId, stage, recruiterId, search, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/board")
    @Operation(summary = "Get applications for Kanban board view")
    public ResponseEntity<ApiResponse<List<ApplicationDTO>>> getApplicationsForBoard(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) Long jobId) {

        List<ApplicationDTO> response = applicationService.getAllApplicationsForBoard(principal.getCompanyId(), jobId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application details by ID")
    public ResponseEntity<ApiResponse<ApplicationDTO>> getApplicationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Submit a candidate application for a job")
    public ResponseEntity<ApiResponse<ApplicationDTO>> createApplication(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateApplicationRequest request) {
        ApplicationDTO created = applicationService.createApplication(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Application submitted successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/stage")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Transition an application to a new pipeline stage with validation")
    public ResponseEntity<ApiResponse<ApplicationDTO>> updateStage(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody UpdateStageRequest request) {
        ApplicationDTO updated = applicationService.updateApplicationStage(id, principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Application stage updated to " + updated.getCurrentStage(), updated));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "Get complete pipeline transition history for an application")
    public ResponseEntity<ApiResponse<List<ApplicationHistoryDTO>>> getApplicationHistory(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(applicationService.getApplicationHistory(id)));
    }
}

