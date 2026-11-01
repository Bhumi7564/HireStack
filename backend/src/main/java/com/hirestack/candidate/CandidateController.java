package com.hirestack.candidate;

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
@RequestMapping("/api/v1/candidates")
@RequiredArgsConstructor
@Tag(name = "Candidates", description = "Endpoints for candidate registration, management, and profiles")
public class CandidateController {

    private final CandidateService candidateService;

    @GetMapping
    @Operation(summary = "Search and filter registered candidates with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<CandidateDTO>>> getCandidates(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection) {

        PagedResponse<CandidateDTO> response = candidateService.getCandidatesWithFilters(
                principal.getCompanyId(), source, search, page, size, sortBy, sortDirection);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get candidate details by ID")
    public ResponseEntity<ApiResponse<CandidateDTO>> getCandidateById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(candidateService.getCandidateById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Register a new candidate")
    public ResponseEntity<ApiResponse<CandidateDTO>> createCandidate(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @Valid @RequestBody CreateCandidateRequest request) {
        CandidateDTO created = candidateService.createCandidate(principal.getCompanyId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Candidate registered successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Update candidate details")
    public ResponseEntity<ApiResponse<CandidateDTO>> updateCandidate(
            @PathVariable Long id,
            @Valid @RequestBody CreateCandidateRequest request) {
        CandidateDTO updated = candidateService.updateCandidate(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Candidate updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'RECRUITER')")
    @Operation(summary = "Delete candidate record")
    public ResponseEntity<ApiResponse<Void>> deleteCandidate(@PathVariable Long id) {
        candidateService.deleteCandidate(id);
        return ResponseEntity.ok(ApiResponse.ok("Candidate deleted successfully", null));
    }
}

