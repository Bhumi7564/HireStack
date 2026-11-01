package com.hirestack.recruiter;

import com.hirestack.common.ApiResponse;
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
@RequestMapping("/api/v1/recruiters")
@RequiredArgsConstructor
@Tag(name = "Recruiters", description = "Endpoints for managing company recruiters")
public class RecruiterController {

    private final RecruiterService recruiterService;

    @GetMapping
    @Operation(summary = "Get all recruiters for the caller's company")
    public ResponseEntity<ApiResponse<List<RecruiterDTO>>> getRecruiters(
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.ok(recruiterService.getRecruitersByCompany(principal.getCompanyId())));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get recruiter details by ID")
    public ResponseEntity<ApiResponse<RecruiterDTO>> getRecruiterById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(recruiterService.getRecruiterById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Create a recruiter profile for a company user (HR Admin only)")
    public ResponseEntity<ApiResponse<RecruiterDTO>> createRecruiter(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateRecruiterRequest request) {
        RecruiterDTO created = recruiterService.createRecruiter(principal.getCompanyId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Recruiter created successfully", created), HttpStatus.CREATED);
    }
}

