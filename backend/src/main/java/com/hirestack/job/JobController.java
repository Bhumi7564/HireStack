package com.hirestack.job;

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

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
@Tag(name = "Job Openings", description = "Endpoints for creating, managing, filtering, and closing jobs")
public class JobController {

    private final JobService jobService;

    @GetMapping
    @Operation(summary = "Search and filter job openings with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<JobDTO>>> getJobs(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) JobStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        PagedResponse<JobDTO> response = jobService.getJobsWithFilters(
                principal.getCompanyId(), department, location, status, search, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information for a single job opening")
    public ResponseEntity<ApiResponse<JobDTO>> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(jobService.getJobById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Create a new job opening")
    public ResponseEntity<ApiResponse<JobDTO>> createJob(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateJobRequest request) {
        JobDTO created = jobService.createJob(principal.getCompanyId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Job opening created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Update an existing job opening")
    public ResponseEntity<ApiResponse<JobDTO>> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody CreateJobRequest request) {
        JobDTO updated = jobService.updateJob(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Job opening updated successfully", updated));
    }

    @PatchMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Close a job opening")
    public ResponseEntity<ApiResponse<JobDTO>> closeJob(@PathVariable Long id) {
        JobDTO closed = jobService.closeJob(id);
        return ResponseEntity.ok(ApiResponse.ok("Job closed successfully", closed));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Delete a job opening")
    public ResponseEntity<ApiResponse<Void>> deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
        return ResponseEntity.ok(ApiResponse.ok("Job opening deleted successfully", null));
    }
}

